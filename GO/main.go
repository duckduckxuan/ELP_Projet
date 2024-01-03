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
	img, err := openImage("photo3.jpg")
	if err != nil {
		fmt.Println("Error opening image:", err)
		return
	}

	size := img.Bounds().Size()
	var pixels [][]color.Color

	for i := 0; i < size.X; i++ {
		var y []color.Color
		for j := 0; j < size.Y; j++ {
			y = append(y, img.At(i, j))
		}
		pixels = append(pixels, y)
	}

	boxKernel := mat.NewDense(3, 3, []float64{
		0.075, 0.124, 0.075,
		0.124, 0.204, 0.124,
		0.075, 0.124, 0.075,
	})
	spartialFilter(&pixels, boxKernel)

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
	saveImage(nImg, "resultat3.jpg")
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
	ppixel := *pixels

	rows, cols := kernel.Dims()
	offset := rows / 2
	kernelLength := cols

	newImage := make([][]color.Color, len(ppixel))
	for i := range newImage {
		newImage[i] = make([]color.Color, len(ppixel[0]))
	}

	for x := offset; x < len(ppixel)-offset; x++ {
		for y := offset; y < len(ppixel[0])-offset; y++ {
			var sumR, sumG, sumB float64
			for m := 0; m < kernelLength; m++ {
				for n := 0; n < kernelLength; n++ {
					xn := x + m - offset
					yn := y + n - offset
					r, g, b, _ := ppixel[xn][yn].RGBA()
					kernelValue := kernel.At(m, n)
					sumR += float64(r>>8) * kernelValue
					sumG += float64(g>>8) * kernelValue
					sumB += float64(b>>8) * kernelValue
				}
			}
			newPixel := color.RGBA{
				R: uint8(math.Min(math.Max(0, sumR), 255)),
				G: uint8(math.Min(math.Max(0, sumG), 255)),
				B: uint8(math.Min(math.Max(0, sumB), 255)),
				A: 255,
			}
			newImage[x][y] = newPixel
		}
	}
	*pixels = newImage
}
