1 'Note that semicolon and comma are not correctly handled yet:
2 'Comma should separate values by tab.
10 print "No";"Space";"Between";"Words"
20 print "Words","Grouped","At","14","Characters"
30 print "No extra space between numbers:";1;-1;123;-123;"ok"
40 print "Mix";"ABC","DEF","GHI";"JKL"
50 print "Without";
60 print "Linebreak"
70 print "Grouped",
80 print "Without",
90 print "Linebreak"
100 print "Numbers preceeded by space or minus:";0;1;2;3;-1;-2;-3;"ok"
-----
NoSpaceBetweenWords
Words         Grouped       At            14            Characters
No extra space between numbers: 1 -1  123 -123 ok
MixABC        DEF           GHIJKL
WithoutLinebreak
Grouped       Without       Linebreak
Numbers preceeded by space or minus: 0  1  2  3 -1 -2 -3 ok
