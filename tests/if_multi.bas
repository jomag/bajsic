10 ' IF statements may contain multiple statements
20 ' in its THEN and ELSE blocks.
30 if 1 > 0 then print "a1" \ print "a2"
40 if 0 > 1 then print "b1" \ print "b2"
50 if 1 > 0 then print "c1" \ print "c2" else print "d1" \ print "d2"
60 if 0 > 1 then print "e1" \ print "e2" else print "f1" \ print "f2"
------------
a1
a2
c1
c2
f1
f2
