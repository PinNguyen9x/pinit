export function getRandomColors(pairsCount: number): string[] {
  const colors: string[] = []

  // Generate random colors and push each color twice to ensure pairs
  for (let i = 0; i < pairsCount; i++) {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`
    colors.push(randomColor)
    colors.push(randomColor) // Add the color again to make it a pair
  }

  // Shuffle the colors array to randomize the order
  return colors.sort(() => Math.random() - 0.5) // Simple shuffle
}
