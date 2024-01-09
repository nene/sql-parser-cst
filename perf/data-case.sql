SELECT
  CASE
    WHEN (
      (t2.dgns_prcdr=1) AND (
        ((t26.dgns_prcdr=1) AND (t2.complication=t26.complication)) OR
        ((t27.dgns_prcdr=1) AND (t2.complication=t27.complication)) OR
        ((t28.dgns_prcdr=1) AND (t2.complication=t28.complication)) OR
        ((t29.dgns_prcdr=1) AND (t2.complication=t29.complication)) OR
        ((t30.dgns_prcdr=1) AND (t2.complication=t30.complication)) OR
        ((t31.dgns_prcdr=1) AND (t2.complication=t31.complication)) OR
        ((t32.dgns_prcdr=1) AND (t2.complication=t32.complication)) OR
        ((t33.dgns_prcdr=1) AND (t2.complication=t33.complication)) OR
        ((t34.dgns_prcdr=1) AND (t2.complication=t34.complication)) OR
        ((t35.dgns_prcdr=1) AND (t2.complication=t35.complication)) OR
        ((t36.dgns_prcdr=1) AND (t2.complication=t36.complication)) OR
        ((t37.dgns_prcdr=1) AND (t2.complication=t37.complication)) OR
        ((t38.dgns_prcdr=1) AND (t2.complication=t38.complication)) OR
        ((t39.dgns_prcdr=1) AND (t2.complication=t39.complication)) OR
        ((t40.dgns_prcdr=1) AND (t2.complication=t40.complication)) OR
        ((t41.dgns_prcdr=1) AND (t2.complication=t41.complication)) OR
        ((t42.dgns_prcdr=1) AND (t2.complication=t42.complication)) OR
        ((t43.dgns_prcdr=1) AND (t2.complication=t43.complication)) OR
        ((t44.dgns_prcdr=1) AND (t2.complication=t44.complication)) OR
        ((t45.dgns_prcdr=1) AND (t2.complication=t45.complication)) OR
        ((t46.dgns_prcdr=1) AND (t2.complication=t46.complication)) OR
        ((t47.dgns_prcdr=1) AND (t2.complication=t47.complication)) OR
        ((t48.dgns_prcdr=1) AND (t2.complication=t48.complication)) OR
        ((t49.dgns_prcdr=1) AND (t2.complication=t49.complication))
      )
    ) THEN 1
    ELSE 0
  END AS dgns_prcdr
FROM t0
