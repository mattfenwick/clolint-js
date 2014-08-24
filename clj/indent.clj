; good
(a b c)

(a
 b
 c)

(a
  b
  c)

(a b
   c)

; bad
(a
  b
  c)  () ; ( should be at column 1

( a b c) ; a should be at column 2

 (a) ; ( at column 2 instead of 1

       (a) ; ( should be at column 1

(
 a) ; a should be on same line as (

(a ; ) should immediately follow a
)

(
 ) ; empty struct: open and close on same line

(a ) ; ) should be at column 3

[() () ] ; ] should be at column 7

{a
  b
     c}

