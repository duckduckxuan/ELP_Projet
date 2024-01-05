package main

import (
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"math"
	"os"

	"gonum.org/v1/gonum/mat"
)

func main() {
	// Ouvrir l'image
	img, err := openImage("photo1.jpg")
	if err != nil {
		fmt.Println("Error opening image:", err)
		return
	}

	// Convertir l'image en noir et blanc
	grayImg := toGrayscale(img)
	saveImage(grayImg, "resultat_gris.jpg")

	// extraire les valeurs de couleur de chaque pixel d'une image
	size := img.Bounds().Size()
	var pixels [][]color.Color

	for i := 0; i < size.X; i++ {
		var y []color.Color
		for j := 0; j < size.Y; j++ {
			y = append(y, img.At(i, j))
		}
		pixels = append(pixels, y)
	}

	// calculer le Gaussian Kernel et faire la convolution
	boxKernel := mat.NewDense(3, 3, []float64{
		0.075, 0.124, 0.075,
		0.124, 0.204, 0.124,
		0.075, 0.124, 0.075,
	})

	spartialFilter(&pixels, boxKernel)

	// sauvgarder l'image traitée
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

	saveImage(nImg, "resultat1.jpg")
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

func spartialFilter(pixels *[][]color.Color, kernel *mat.Dense) {
	rows, cols := kernel.Dims()
	offset := rows / 2

	newImage := make([][]color.Color, len(*pixels))
	for i := range newImage {
		newImage[i] = make([]color.Color, len((*pixels)[0]))
	}

	for x := offset; x < len(*pixels)-offset; x++ {
		for y := offset; y < len((*pixels)[0])-offset; y++ {
			var sumR, sumG, sumB float64
			for dx := 0; dx < rows; dx++ {
				for dy := 0; dy < cols; dy++ {
					pixel := (*pixels)[x+dx-offset][y+dy-offset]
					r, g, b, _ := pixel.RGBA()
					kernelValue := kernel.At(dx, dy)
					sumR += (float64(r) / 65535) * kernelValue
					sumG += (float64(g) / 65535) * kernelValue
					sumB += (float64(b) / 65535) * kernelValue
				}
			}
			newPixel := color.RGBA{
				R: uint8(math.Min(math.Max(0, sumR*255), 255)),
				G: uint8(math.Min(math.Max(0, sumG*255), 255)),
				B: uint8(math.Min(math.Max(0, sumB*255), 255)),
				A: 255,
			}
			newImage[x][y] = newPixel
		}
	}

	*pixels = newImage
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
