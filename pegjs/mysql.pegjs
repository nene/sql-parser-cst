start = "SELECT" __ "*" { return true }

__ = [ \t\n\r]+
