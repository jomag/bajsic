10 print "Start recursion test"
20 print fnfactor(5)
30 print fnfactor(7)
40 print "Done!"
50 end
100 def fnfactor(n)
110 if n > 1 then fnfactor = n * fnfactor(n - 1) else fnfactor = 1
120 fnend
-------------
Start recursion test
 120 
 5040 
Done!
