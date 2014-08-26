(def)
(def x)
(def 3 4)
(def x 4 "abc")
(def x y z a)
(def x 3) ; a good one!
(def x (def 4 5))

(if)
(if x)
(if x y)
(if x y z)
(if x y z a)
(if (if) (if) (if))

(quote)
(quote x)
(quote x y)
(quote a 
       b 
       (quote) ; this is okay
       (quote c d e)) #! and so is this

(var)
(var x)
(var 3)
(var x y)
(var 3 z)

(throw)
(throw 3)
(throw 4 5)

(new)
(new 1)
(new 1 2)

(monitor-enter)
(monitor-enter x)
(monitor-enter x y)

(monitor-exit)
(monitor-exit x)
(monitor-exit x y)

