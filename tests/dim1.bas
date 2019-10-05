10 'Subscripted and unsubscripted can reuse the same variable name
20 DIM X(20)
30 X(1) = 123
40 X = 456
50 X(2) = 789
60 PRINT X(1),X,X(2)
----------
123
456
789