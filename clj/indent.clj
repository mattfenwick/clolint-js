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
  c)  () ; ( should be at column 1.  report (18, 7)

( a b c) ; a should be at column 2.  (20, 3)

 (a) ; ( at column 2 instead of 1.  (22, 2)

       (a) ; ( should be at column 1. (24, 8)

(
 a) ; a should be on same line as (.  (27, 2)

(a ; ) should immediately follow a.  (30, 1)
)

(
 ) ; empty struct: open and close on same line.  (33, 2)

(a ) ; ) should be at column 3.  (35, 4)

[() () ] ; ] should be at column 7.  (37, 8)

{a
  b
     c} ; c should be in column 3 ... or so.  (41, 6)

( ) ; empty struct: close immediately follows open.  (43, 3)



#! some more good ones:

#{}
()

