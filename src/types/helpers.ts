export const getWithKey = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key]
