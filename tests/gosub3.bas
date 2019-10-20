10 rem GOSUB statements in IF THEN or ELSE blocks should continue with
20 rem next statement on RETURN
30 A = 0
40 IF A = 0 THEN PRINT "A1"; \ GOSUB 100 \ PRINT "A2"
50 PRINT "Done."
60 END
100 PRINT " AND ";
110 RETURN
---------------
A1 AND A2
Done.
