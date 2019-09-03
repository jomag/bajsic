10 print "Start"
20 gosub 100
30 print "End of GOSUB test"
40 end
100 print "Enter subroutine 1"
110 gosub 200
120 print "Return from subroutine 1"
130 return
200 print "Enter subroutine 2, and return immediately"
210 return
------
Start
Enter subroutine 1
Enter subroutine 2, and return immediately
Return from subroutine 1
End of GOSUB test
