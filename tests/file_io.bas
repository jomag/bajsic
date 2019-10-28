10 FILENAME$ = "/tmp/bajsic-file-io-test"
20 OPEN FILENAME$ FOR OUTPUT AS FILE #1
30 PRINT "File opened for output"
40 PRINT #1, I*I FOR I=0 TO 8
50 CLOSE #1
60 OPEN FILENAME$ FOR INPUT AS FILE #2
70 FOR I=0 TO 8
80 INPUT #2, A
90 PRINT "Line";I;":";A
100 NEXT I
110 CLOSE #2
-----------
File opened for output
Line 0 : 0 
Line 1 : 1 
Line 2 : 4 
Line 3 : 9 
Line 4 : 16 
Line 5 : 25 
Line 6 : 36 
Line 7 : 49 
Line 8 : 64 
