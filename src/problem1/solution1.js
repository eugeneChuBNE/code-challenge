var sum_to_n_a = function(n) {
    // your code here
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
    /*
    as this is a traditional way to solve this kind of problem
    - using a loop to keep adding then increasing until we got the sum that we need to find
    - i dont think that i have to explain much about it as it's so
    */ 
};

var sum_to_n_b = function(n) {
    // your code here
    return n * (n + 1) / 2;

    /* Using arithmetic series formula, where sum = (n/2) x (n+1)
    Well, this way gives us the result instantly, and i think this is the fastest and cleanest method
    */
};

var sum_to_n_c = function(n) {
    // your code here
    let result = n; 
    if (n > 1) {
        result += sum_to_n_c(n - 1); 
    }
    return result;

    /* For the third one I make it to perform recursion(s)
    Anyway, because this task asks me to provide 3 ways so I think of this one is gonna help 
    but yea, if n is a "big boiz",
    this method may take a little bit longer as its time and space complexities are both O(n) */
};

/* 

In summary:

|------------|------------------------------------------|-------------------|-----------------------|
|            |              description                 |  Time complexity  |   Space complexity    |
|------------|------------------------------------------|-------------------|-----------------------|
| sum_to_n_a | the tradition way (using iterative loop) |       O(n)        |           O(1)        |
|            |    simple and easy to understand         |                   |                       |
|------------|------------------------------------------|-------------------|-----------------------|
| sum_to_n_b | using arithmetic series formula:         |       O(1)        |           O(1)        |
|            |      sum = (n/2) x (n+1)                 |                   |                       |
|------------|------------------------------------------|-------------------|-----------------------|
| sum_to_n_c | recursion                                |       O(n)        |           O(n)        |
|------------|------------------------------------------|-------------------|-----------------------|

*/