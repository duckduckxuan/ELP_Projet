package main

import (
	"fmt"
	"log"
	"net"
)

func main() {
	conn, err := net.Dial("tcp", "localhost:8888")
	if err != nil {
		fmt.Println("Error connecting:", err)
		return
	}
	defer conn.Close()

	// Read server response
	buffer := make([]byte, 1024)
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Println("Error reading:", err)
		return
	}
	fmt.Println(string(buffer[:n]))

	for {
		// Get command from user
		fmt.Print("Enter command: 1->gray ; 2->blur ; 3->reverse ; 4->disconnect: ")
		var cmd string
		fmt.Scanln(&cmd)

		switch cmd {
		// Send command to server
		case "1", "2", "3":
			_, err := conn.Write([]byte(cmd))
			if err != nil {
				log.Fatal(err)
			}

		// Disconnect
		case "4":
			_, err := conn.Write([]byte(cmd))
			if err != nil {
				log.Fatal(err)
			}
			// Wait for server to acknowledge the disconnect
			n, err = conn.Read(buffer)
			fmt.Println("Disconnecting......")
			if err != nil {
				log.Fatal("Error reading:", err)
			}
			return

		// Enter correct choice
		default:
			fmt.Println("Invalid choice")
		}
	}
}
