package main

import "fmt"

func sum_to_n_a(n int) int {
	sum := 0
	for i := 1; i <= n; i++ {
		sum += i
	}
	return sum
}

func sum_to_n_b(n int) int {
	return n * (n + 1) / 2
}

func sum_to_n_c(n int) int {
	result := n
	if n > 1 {
		result += sum_to_n_c(n - 1)
	}
	return result
}

func main() {
	fmt.Println(sum_to_n_a(5)) // 15
	fmt.Println(sum_to_n_b(5)) // 15
	fmt.Println(sum_to_n_c(5)) // 15
}

/*
Well, i just converted everything from the prob1 into Golang 
(as I see it's a golang template on the Notion site)
so basically i have nothing to explain here anymore :D
*/