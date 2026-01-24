/**
 * Triggers a JSON file download in the browser
 * @param data - The data to be downloaded as JSON
 * @param filename - The name of the file (without extension)
 */
export function downloadJson(data: unknown, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
