import pandas as pd
data_xls = pd.read_excel('Purchase1view-09092019.xlsx', 'Sheet1', index_col=None)
data_xls.to_csv('psv.csv', encoding='utf-8', index=False)
