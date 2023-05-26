/**
 * @webxr-input-profiles/motion-controllers 1.0.0 https://github.com/immersive-web/webxr-input-profiles
 */

import type { Object3D } from 'three'

interface GamepadIndices {
  button: number
  xAxis?: number
  yAxis?: number
}

interface VisualResponseDescription {
  componentProperty: string
  states: string[]
  valueNodeProperty: string
  valueNodeName: string
  minNodeName?: string
  maxNodeName?: string
}

type VisualResponses = Record<string, VisualResponseDescription>

interface ComponentDescription {
  type: string
  gamepadIndices: GamepadIndices
  rootNodeName: string
  visualResponses: VisualResponses
  touchPointNodeName?: string
}

interface Components {
  [componentKey: string]: ComponentDescription
}

interface LayoutDescription {
  selectComponentId: string
  components: Components
  gamepadMapping: string
  rootNodeName: string
  assetPath: string
}

type Layouts = Partial<Record<XRHandedness, LayoutDescription>>

export interface Profile {
  profileId: string
  fallbackProfileIds: string[]
  layouts: Layouts
}

interface ProfilesList {
  [profileId: string]: { path: string; deprecated?: boolean } | undefined
}

const MotionControllerConstants = {
  Handedness: {
    NONE: 'none',
    LEFT: 'left',
    RIGHT: 'right',
  },

  ComponentState: {
    DEFAULT: 'default',
    TOUCHED: 'touched',
    PRESSED: 'pressed',
  },

  ComponentProperty: {
    BUTTON: 'button',
    X_AXIS: 'xAxis',
    Y_AXIS: 'yAxis',
    STATE: 'state',
  },

  ComponentType: {
    TRIGGER: 'trigger',
    SQUEEZE: 'squeeze',
    TOUCHPAD: 'touchpad',
    THUMBSTICK: 'thumbstick',
    BUTTON: 'button',
  },

  ButtonTouchThreshold: 0.05,

  AxisTouchThreshold: 0.1,

  VisualResponseProperty: {
    TRANSFORM: 'transform',
    VISIBILITY: 'visibility',
  },
}

/**
 * @description Static helper function to fetch a JSON file and turn it into a JS object
 * @param {string} path - Path to JSON file to be fetched
 */
async function fetchJsonFile<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(response.statusText)
  } else {
    return response.json()
  }
}

async function fetchProfilesList(basePath: string): Promise<ProfilesList> {
  if (!basePath) {
    throw new Error('No basePath supplied')
  }

  const profileListFileName = 'profilesList.json'
  const profilesList = await fetchJsonFile<ProfilesList>(`${basePath}/${profileListFileName}`)
  return profilesList
}

async function fetchProfile(
  xrInputSource: XRInputSource,
  basePath: string,
  defaultProfile: string | null = null,
  getAssetPath = true,
): Promise<{ profile: Profile; assetPath: string | undefined }> {
  if (!xrInputSource) {
    throw new Error('No xrInputSource supplied')
  }

  if (!basePath) {
    throw new Error('No basePath supplied')
  }

  // Get the list of profiles
  const supportedProfilesList = await fetchProfilesList(basePath)

  // Find the relative path to the first requested profile that is recognized
  let match: { profileId: string; profilePath: string; deprecated: boolean } | undefined = undefined
  xrInputSource.profiles.some((profileId: string) => {
    const supportedProfile = supportedProfilesList[profileId]
    if (supportedProfile) {
      match = {
        profileId,
        profilePath: `${basePath}/${supportedProfile.path}`,
        deprecated: !!supportedProfile.deprecated,
      }
    }
    return !!match
  })

  if (!match) {
    if (!defaultProfile) {
      throw new Error('No matching profile name found')
    }

    const supportedProfile = supportedProfilesList[defaultProfile]
    if (!supportedProfile) {
      throw new Error(`No matching profile name found and default profile "${defaultProfile}" missing.`)
    }

    match = {
      profileId: defaultProfile,
      profilePath: `${basePath}/${supportedProfile.path}`,
      deprecated: !!supportedProfile.deprecated,
    }
  }

  const profile = await fetchJsonFile<Profile>(match.profilePath)

  let assetPath: string | undefined = undefined
  if (getAssetPath) {
    let layout
    if ((xrInputSource.handedness as string) === 'any') {
      layout = profile.layouts[Object.keys(profile.layouts)[0] as XRHandedness]
    } else {
      layout = profile.layouts[xrInputSource.handedness]
    }
    if (!layout) {
      throw new Error(`No matching handedness, ${xrInputSource.handedness}, in profile ${match.profileId}`)
    }

    if (layout.assetPath) {
      assetPath = match.profilePath.replace('profile.json', layout.assetPath)
    }
  }

  return { profile, assetPath }
}

/** @constant {Object} */
const defaultComponentValues = {
  xAxis: 0,
  yAxis: 0,
  button: 0,
  state: MotionControllerConstants.ComponentState.DEFAULT,
}

/**
 * @description Converts an X, Y coordinate from the range -1 to 1 (as reported by the Gamepad
 * API) to the range 0 to 1 (for interpolation). Also caps the X, Y values to be bounded within
 * a circle. This ensures that thumbsticks are not animated outside the bounds of their physical
 * range of motion and touchpads do not report touch locations off their physical bounds.
 * @param {number | undefined} x The original x coordinate in the range -1 to 1
 * @param {number | undefined} y The original y coordinate in the range -1 to 1
 */
function normalizeAxes(
  x: number | undefined = 0,
  y: number | undefined = 0,
): { normalizedXAxis: number; normalizedYAxis: number } {
  let xAxis = x
  let yAxis = y

  // Determine if the point is outside the bounds of the circle
  // and, if so, place it on the edge of the circle
  const hypotenuse = Math.sqrt(x * x + y * y)
  if (hypotenuse > 1) {
    const theta = Math.atan2(y, x)
    xAxis = Math.cos(theta)
    yAxis = Math.sin(theta)
  }

  // Scale and move the circle so values are in the interpolation range.  The circle's origin moves
  // from (0, 0) to (0.5, 0.5). The circle's radius scales from 1 to be 0.5.
  const result = {
    normalizedXAxis: xAxis * 0.5 + 0.5,
    normalizedYAxis: yAxis * 0.5 + 0.5,
  }
  return result
}

/**
 * Contains the description of how the 3D model should visually respond to a specific user input.
 * This is accomplished by initializing the object with the name of a node in the 3D model and
 * property that need to be modified in response to user input, the name of the nodes representing
 * the allowable range of motion, and the name of the input which triggers the change. In response
 * to the named input changing, this object computes the appropriate weighting to use for
 * interpolating between the range of motion nodes.
 */
class VisualResponse implements VisualResponseDescription {
  value: number | boolean
  componentProperty: string
  states: string[]
  valueNodeName: string
  valueNodeProperty: string
  minNodeName?: string
  maxNodeName?: string
  valueNode: Object3D | undefined
  minNode: Object3D | undefined
  maxNode: Object3D | undefined
  constructor(visualResponseDescription: VisualResponseDescription) {
    this.componentProperty = visualResponseDescription.componentProperty
    this.states = visualResponseDescription.states
    this.valueNodeName = visualResponseDescription.valueNodeName
    this.valueNodeProperty = visualResponseDescription.valueNodeProperty

    if (this.valueNodeProperty === MotionControllerConstants.VisualResponseProperty.TRANSFORM) {
      this.minNodeName = visualResponseDescription.minNodeName
      this.maxNodeName = visualResponseDescription.maxNodeName
    }

    // Initializes the response's current value based on default data
    this.value = 0
    this.updateFromComponent(defaultComponentValues)
  }

  /**
   * Computes the visual response's interpolation weight based on component state
   * @param {Object} componentValues - The component from which to update
   * @param {number | undefined} xAxis - The reported X axis value of the component
   * @param {number | undefined} yAxis - The reported Y axis value of the component
   * @param {number | undefined} button - The reported value of the component's button
   * @param {string} state - The component's active state
   */
  updateFromComponent({
    xAxis,
    yAxis,
    button,
    state,
  }: {
    xAxis?: number
    yAxis?: number
    button?: number
    state: string
  }): void {
    const { normalizedXAxis, normalizedYAxis } = normalizeAxes(xAxis, yAxis)
    switch (this.componentProperty) {
      case MotionControllerConstants.ComponentProperty.X_AXIS:
        this.value = this.states.includes(state) ? normalizedXAxis : 0.5
        break
      case MotionControllerConstants.ComponentProperty.Y_AXIS:
        this.value = this.states.includes(state) ? normalizedYAxis : 0.5
        break
      case MotionControllerConstants.ComponentProperty.BUTTON:
        this.value = this.states.includes(state) && button ? button : 0
        break
      case MotionControllerConstants.ComponentProperty.STATE:
        if (this.valueNodeProperty === MotionControllerConstants.VisualResponseProperty.VISIBILITY) {
          this.value = this.states.includes(state)
        } else {
          this.value = this.states.includes(state) ? 1.0 : 0.0
        }
        break
      default:
        throw new Error(`Unexpected visualResponse componentProperty ${this.componentProperty}`)
    }
  }
}

class Component implements ComponentDescription {
  id: string
  values: {
    state: string
    button: number | undefined
    xAxis: number | undefined
    yAxis: number | undefined
  }

  type: string
  gamepadIndices: GamepadIndices
  rootNodeName: string
  visualResponses: Record<string, VisualResponse>
  touchPointNodeName?: string | undefined
  touchPointNode?: Object3D

  /**
   * @param {string} componentId - Id of the component
   * @param {InputProfileComponent} componentDescription - Description of the component to be created
   */
  constructor(componentId: string, componentDescription: ComponentDescription) {
    if (
      !componentId ||
      !componentDescription ||
      !componentDescription.visualResponses ||
      !componentDescription.gamepadIndices ||
      Object.keys(componentDescription.gamepadIndices).length === 0
    ) {
      throw new Error('Invalid arguments supplied')
    }

    this.id = componentId
    this.type = componentDescription.type
    this.rootNodeName = componentDescription.rootNodeName
    this.touchPointNodeName = componentDescription.touchPointNodeName

    // Build all the visual responses for this component
    this.visualResponses = {}
    Object.keys(componentDescription.visualResponses).forEach((responseName) => {
      const visualResponse = new VisualResponse(componentDescription.visualResponses[responseName])
      this.visualResponses[responseName] = visualResponse
    })

    // Set default values
    this.gamepadIndices = Object.assign({}, componentDescription.gamepadIndices)

    this.values = {
      state: MotionControllerConstants.ComponentState.DEFAULT,
      button: this.gamepadIndices.button !== undefined ? 0 : undefined,
      xAxis: this.gamepadIndices.xAxis !== undefined ? 0 : undefined,
      yAxis: this.gamepadIndices.yAxis !== undefined ? 0 : undefined,
    }
  }

  get data(): { id: Component['id'] } & Component['values'] {
    const data = { id: this.id, ...this.values }
    return data
  }

  /**
   * @description Poll for updated data based on current gamepad state
   * @param {Object} gamepad - The gamepad object from which the component data should be polled
   */
  updateFromGamepad(gamepad: Gamepad): void {
    // Set the state to default before processing other data sources
    this.values.state = MotionControllerConstants.ComponentState.DEFAULT

    // Get and normalize button
    if (this.gamepadIndices.button !== undefined && gamepad.buttons.length > this.gamepadIndices.button) {
      const gamepadButton = gamepad.buttons[this.gamepadIndices.button]
      this.values.button = gamepadButton.value
      this.values.button = this.values.button! < 0 ? 0 : this.values.button
      this.values.button = this.values.button! > 1 ? 1 : this.values.button

      // Set the state based on the button
      if (gamepadButton.pressed || this.values.button === 1) {
        this.values.state = MotionControllerConstants.ComponentState.PRESSED
      } else if (gamepadButton.touched || this.values.button! > MotionControllerConstants.ButtonTouchThreshold) {
        this.values.state = MotionControllerConstants.ComponentState.TOUCHED
      }
    }

    // Get and normalize x axis value
    if (this.gamepadIndices.xAxis !== undefined && gamepad.axes.length > this.gamepadIndices.xAxis) {
      this.values.xAxis = gamepad.axes[this.gamepadIndices.xAxis]
      this.values.xAxis = this.values.xAxis! < -1 ? -1 : this.values.xAxis
      this.values.xAxis = this.values.xAxis! > 1 ? 1 : this.values.xAxis

      // If the state is still default, check if the xAxis makes it touched
      if (
        this.values.state === MotionControllerConstants.ComponentState.DEFAULT &&
        Math.abs(this.values.xAxis!) > MotionControllerConstants.AxisTouchThreshold
      ) {
        this.values.state = MotionControllerConstants.ComponentState.TOUCHED
      }
    }

    // Get and normalize Y axis value
    if (this.gamepadIndices.yAxis !== undefined && gamepad.axes.length > this.gamepadIndices.yAxis) {
      this.values.yAxis = gamepad.axes[this.gamepadIndices.yAxis]
      this.values.yAxis = this.values.yAxis! < -1 ? -1 : this.values.yAxis
      this.values.yAxis = this.values.yAxis! > 1 ? 1 : this.values.yAxis

      // If the state is still default, check if the yAxis makes it touched
      if (
        this.values.state === MotionControllerConstants.ComponentState.DEFAULT &&
        Math.abs(this.values.yAxis!) > MotionControllerConstants.AxisTouchThreshold
      ) {
        this.values.state = MotionControllerConstants.ComponentState.TOUCHED
      }
    }

    // Update the visual response weights based on the current component data
    Object.values(this.visualResponses).forEach((visualResponse) => {
      visualResponse.updateFromComponent(this.values)
    })
  }
}
/**
 * @description Builds a motion controller with components and visual responses based on the
 * supplied profile description. Data is polled from the xrInputSource's gamepad.
 * @author Nell Waliczek / https://github.com/NellWaliczek
 */
class MotionController {
  xrInputSource: XRInputSource
  assetUrl: string
  layoutDescription: LayoutDescription
  id: string
  components: Record<string, Component>
  /**
   * @param {XRInputSource} xrInputSource - The XRInputSource to build the MotionController around
   * @param {Profile} profile - The best matched profile description for the supplied xrInputSource
   * @param {string} assetUrl
   */
  constructor(xrInputSource: XRInputSource, profile: Profile, assetUrl: string) {
    if (!xrInputSource) {
      throw new Error('No xrInputSource supplied')
    }

    if (!profile) {
      throw new Error('No profile supplied')
    }

    if (!profile.layouts[xrInputSource.handedness]) {
      throw new Error('No layout for ' + xrInputSource.handedness + ' handedness')
    }

    this.xrInputSource = xrInputSource
    this.assetUrl = assetUrl
    this.id = profile.profileId

    // Build child components as described in the profile description
    this.layoutDescription = profile.layouts[xrInputSource.handedness]!

    this.components = {}
    Object.keys(this.layoutDescription.components).forEach((componentId) => {
      const componentDescription = this.layoutDescription.components[componentId]
      this.components[componentId] = new Component(componentId, componentDescription)
    })

    // Initialize components based on current gamepad state
    this.updateFromGamepad()
  }

  get gripSpace(): XRInputSource['gripSpace'] {
    return this.xrInputSource.gripSpace
  }

  get targetRaySpace(): XRInputSource['targetRaySpace'] {
    return this.xrInputSource.targetRaySpace
  }

  /**
   * @description Returns a subset of component data for simplified debugging
   */
  get data(): Array<Component['data']> {
    const data: Array<Component['data']> = []
    Object.values(this.components).forEach((component) => {
      data.push(component.data)
    })
    return data
  }

  /**
   * @description Poll for updated data based on current gamepad state
   */
  updateFromGamepad(): void {
    Object.values(this.components).forEach((component) => {
      component.updateFromGamepad(this.xrInputSource.gamepad!)
    })
  }
}

export { MotionControllerConstants, MotionController, fetchProfile, fetchProfilesList }
