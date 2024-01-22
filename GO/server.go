package main

import (
	"fmt"
	"io"
	"net"
)

func handleConnection(conn net.Conn) {
	defer conn.Close()

	for {
		// Send a message to client
		message := "Connexion OK"
		conn.Write([]byte(message))

		// Listen commands from client
		buffer := make([]byte, 1024)
		n, err := conn.Read(buffer)
		if err != nil {
			if err != io.EOF {
				fmt.Println("Error reading:", err)
			}
			break
		}

		// Get commands from client
		command := string(buffer[:n])

		// Deal with commands
		switch command {
		case "1":
			Traitement_griser()

		case "2":
			Traitement_flouter()

		case "3":
			Traitement_inverser()

		case "4":
			fmt.Println("Client requested to close the connection")
			return
		}
	}
}

func main() {
	listener, err := net.Listen("tcp", "localhost:8888")
	if err != nil {
		fmt.Println("Error listening:", err)
		return
	}
	defer listener.Close()

	fmt.Println("Server listening on localhost:8888")

	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err)
			continue
		}

		go handleConnection(conn)
	}
}
