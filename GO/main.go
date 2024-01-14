package main

import (
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"math"
	"os"
	"sync"

	"gonum.org/v1/gonum/mat"
)

func main() {
	// Ouvrir l'image
	img, err := openImage("photo1.jpg")
	if err != nil {
		fmt.Println("Error opening image:", err)
		return
	}

	// Extraire les valeurs de couleur de chaque pixel d'une image
	pixels := extraire_pixel(img)

	// Convertir l'image en noir et blanc
	grayImg := toGrayscale(img)
	saveImage(grayImg, "resultat_gris.jpg")

	// Flouter l'image et rentourner l'image floutée
	boxKernel, err := boxKernel(5, 7)
	if err != nil {
		fmt.Println("Error generating boxKernel:", err)
		return
	}
	blur(&pixels, boxKernel, 10, 10)
	blurImage := createBlurredImage(pixels)
	saveImage(blurImage, "resultat_blur.jpg")
}

func openImage(path string) (image.Image, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	fi, _ := f.Stat()
	fmt.Println(fi.Name())

	img, format, err := image.Decode(f)
	if err != nil {
		return nil, err
	}
	if format != "jpeg" {
		return nil, errors.New("image format is not JPEG")
	}

	return img, nil
}

func saveImage(img image.Image, filePath string) error {
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()
	return jpeg.Encode(file, img, &jpeg.Options{Quality: jpeg.DefaultQuality})
}

// Extraire les valeurs de couleur de chaque pixel d'une image
func extraire_pixel(img image.Image) [][]color.Color {
	size := img.Bounds().Size()
	var pixels [][]color.Color

	for i := 0; i < size.X; i++ {
		var y []color.Color
		for j := 0; j < size.Y; j++ {
			y = append(y, img.At(i, j))
		}
		pixels = append(pixels, y)
	}
	return pixels
}

// Calculer le poids de propabilité de chaque points dans le Gaussian Kernel
func calculPropability(x float64, y float64, sigma float64) float64 {
	return math.Exp(-(x*x + y*y) / (2 * sigma * sigma))
}

// Calculer le Gaussian Kernel selon la taille et la valeur de sigma à choisir
func boxKernel(taille int, sigma float64) (*mat.Dense, error) {
	if taille < 1 || taille%2 == 0 {
		return nil, errors.New("la taille doit être impaire et positive")
	}

	borne1 := float64(-(taille - 1) / 2)
	borne2 := float64((taille - 1) / 2)
	var matrice []float64
	poids := 0.0

	// Créer le Gaussian Kernel
	for i := borne1; i <= borne2; i++ {
		for j := borne1; j <= borne2; j++ {
			matrice = append(matrice, calculPropability(i, j, sigma))
			poids += calculPropability(i, j, sigma)
		}
	}

	// Normaliser le Gaussian Kernel
	for k := 0; k < len(matrice); k++ {
		matrice[k] /= poids
	}

	return mat.NewDense(taille, taille, matrice), nil
}

// Flouter l'image par la convolution
func blur(pixels *[][]color.Color, kernel *mat.Dense, numXSections int, numYSections int) {
	rows, cols := kernel.Dims()
	offset := rows / 2
	var wait_group sync.WaitGroup

	newImage := make([][]color.Color, len(*pixels))
	for i := range newImage {
		newImage[i] = make([]color.Color, len((*pixels)[0]))
	}

	// Définir la longueur d'une section
	sectionWidth := len(*pixels) / numXSections
	sectionHeight := len((*pixels)[0]) / numYSections

	// Parcourir les sections différentes
	for sx := 0; sx < numXSections; sx++ {
		for sy := 0; sy < numYSections; sy++ {

			// Calculer la position du départ et d'arrivée
			startX := sx * sectionWidth
			endX := startX + sectionWidth
			startY := sy * sectionHeight
			endY := startY + sectionHeight

			// Modifier la position d'arrivée de la dernière section
			if sx == numXSections-1 {
				endX = len(*pixels)
			}
			if sy == numYSections-1 {
				endY = len((*pixels)[0])
			}

			wait_group.Add(1)

			// Créer une goroutine
			go func(startX, endX, startY, endY int) {
				defer wait_group.Done()

				// Parcourir tout les pixels d'une section
				for x := startX; x < endX; x++ {
					for y := startY; y < endY; y++ {
						var sumR, sumG, sumB float64

						// Parcourir les pixels d'une partie à faire la convolution
						for dx := 0; dx < rows; dx++ {
							for dy := 0; dy < cols; dy++ {
								px := x + dx - offset
								py := y + dy - offset

								// Vérifier le bord
								if px < 0 || px >= len(*pixels) || py < 0 || py >= len((*pixels)[0]) {
									continue
								}

								// Faire la convolution
								pixel := (*pixels)[px][py]
								r, g, b, _ := pixel.RGBA()
								kernelValue := kernel.At(dx, dy)
								sumR += (float64(r) / 65535) * kernelValue
								sumG += (float64(g) / 65535) * kernelValue
								sumB += (float64(b) / 65535) * kernelValue
							}
						}

						// Modifier les valeurs RGB (la valeur de A ne change pas car l'image est en forme jpg/jpeg mais pas png)
						newPixel := color.RGBA{
							R: uint8(math.Min(math.Max(0, sumR*255), 255)),
							G: uint8(math.Min(math.Max(0, sumG*255), 255)),
							B: uint8(math.Min(math.Max(0, sumB*255), 255)),
							A: 255,
						}
						newImage[x][y] = newPixel
					}
				}
			}(startX, endX, startY, endY)
		}
	}

	// Attendre la fin de toutes les goroutines
	wait_group.Wait()
	*pixels = newImage
}

// Tranformer la matrice "color.Color" vers l'objet "image.RGBA"
func createBlurredImage(pixels [][]color.Color) *image.RGBA {
	rect := image.Rect(0, 0, len(pixels), len(pixels[0]))
	nImg := image.NewRGBA(rect)

	for x := 0; x < len(pixels); x++ {
		for y := 0; y < len(pixels[0]); y++ {
			p := pixels[x][y]
			if p != nil {
				original, ok := color.RGBAModel.Convert(p).(color.RGBA)
				if ok {
					nImg.Set(x, y, original)
				}
			}
		}
	}

	return nImg
}

func toGrayscale(img image.Image) *image.Gray {
	// Obtenir les dimensions de l'image
	bounds := img.Bounds()
	width, height := bounds.Dx(), bounds.Dy()

	// Créer une nouvelle image en niveaux de gris
	grayImg := image.NewGray(bounds)

	// Parcourir chaque pixel de l'image
	for x := 0; x < width; x++ {
		for y := 0; y < height; y++ {
			// Obtenir la couleur du pixel
			col := img.At(x, y)

			// Convertir la couleur en niveaux de gris (luminance)
			grayValue := luminance(col)

			// Définir la nouvelle valeur du pixel en niveaux de gris
			grayImg.SetGray(x, y, color.Gray{Y: uint8(grayValue)})
		}
	}

	return grayImg
}

func luminance(c color.Color) float64 {
	// Extraire les composantes de couleur du pixel
	r, g, b, _ := c.RGBA()

	// Calculer la luminance (moyenne pondérée)
	return 0.299*float64(r) + 0.587*float64(g) + 0.114*float64(b)
}
