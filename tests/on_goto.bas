10 X = -2
20 ON X GOTO 200, 300, 400, 500
30 PRINT "Line 30: "; X
100 X = X + 1
110 GOTO 20
200 PRINT "Line 200: "; X
210 GOTO 100
300 PRINT "Line 300: "; X
310 GOTO 100
400 PRINT "Line 400: "; X
410 GOTO 100
500 PRINT "Line 500: "; X
510 END
------------
Line 30: -2 
Line 30: -1 
Line 30:  0 
Line 200:  1 
Line 300:  2 
Line 400:  3 
Line 500:  4 
