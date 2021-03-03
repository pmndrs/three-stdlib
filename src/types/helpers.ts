export const getWithKey = <T, K extends keyof T>(obj: T, key: K) => obj[key]
