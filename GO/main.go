package main

import (
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"os"

	"gonum.org/v1/gonum/mat"
)

func main() {
	img, err := openImage("photo2.jpg")
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
			original, ok := color.RGBAModel.Convert(p).(color.RGBA)
			if ok {
				nImg.Set(x, y, original)
			}
		}
	}

	saveImage(img, "resultat2.jpg")
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

	rows, col := kernel.Dims()
	offset := float64(rows / 2)
	kernelLength := float64(col)

	newImage := make([][]color.Color, len(ppixel))
	for i := 0; i < len(newImage); i++ {
		newImage[i] = make([]color.Color, len(ppixel[0]))
	}
	copy(newImage, ppixel)

	for x := offset; x < float64(len(ppixel))-offset; x++ {
		for y := offset; y < float64(len(ppixel[0]))-offset; y++ {
			newPixel := color.RGBA{}
			for a := 0.0; a < kernelLength; a++ {
				for b := 0.0; b < kernelLength; b++ {
					xn := x + a - offset
					yn := y + a - offset
					r, g, bb, aa := ppixel[int(xn)][int(yn)].RGBA()
					newPixel.R += uint8(float64(uint8(r)) * (kernel.At(int(a), int(b))))
					newPixel.G += uint8(float64(uint8(g)) * (kernel.At(int(a), int(b))))
					newPixel.B += uint8(float64(uint8(bb)) * (kernel.At(int(a), int(b))))
					newPixel.A += uint8(float64(uint8(aa)) * (kernel.At(int(a), int(b))))
				}
			}
			newImage[int(x)][int(y)] = newPixel
		}
	}
	*pixels = newImage
}
