1 ' Note that str$ is not completely implemented according to the spec,
2 ' which has a quite complicated way to decide on presentation format
10 print str$(0)
20 print str$(-100)
30 print str$(1543.659)
---------
0
-100
1543.659
