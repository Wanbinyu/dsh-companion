declare module '*.module.css' {
  const classes: Record<string, string>
  export const stylesheet: string
  export default classes
}
