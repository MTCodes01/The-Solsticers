import csv, json
with open('PSCompPars.csv') as fh:
    reader = csv.reader(fh)
    for i in range(88):
        next(reader)
    fields = next(reader)
    dict_ = {i:field for i, field in enumerate(fields) if field in ['pl_name','hostname','discoverymethod','disc_year','disc_facility','pl_orbper','pl_rade','pl_bmasse','pl_insol','pl_orbsmax','pl_eqt','pl_orbeccen','st_spectype','st_teff','sy_dist']}
    lst = []
    for i in range(5000):
        data = next(reader)
        data_dict = {dict_[j]:k for j, k in enumerate(data) if j in dict_.keys()}
        for k, v in data_dict.items():
            if v == '':
                data_dict[k] = 'NULL'
        lst.append(data_dict)

dict_2 = {"info": lst}
with open('data.json', 'w') as fh:
    json.dump(dict_2, fh)

