10 if 2 > 1 then 30
20 print "ERROR!"
30 print "Test 1: ok"
40 if 1 > 2 then 50 else 60
50 print "ERROR!"
60 print "Test 2: ok"
100 if 1 > 2 then 10
110 print "Test 3: ok"
200 if 2 > 1 then goto 220
210 print "ERROR!"
220 print "Test 4: ok"
300 if 1 > 2 then goto 310 else goto 320
310 print "ERROR!"
320 print "Test 5: ok"
----
Test 1: ok
Test 2: ok
Test 3: ok
Test 4: ok
Test 5: ok
