if [ -e "/home/atd-user/backup/previous_FR.json" ]; then
    test=$(diff -u /home/atd-user/backup/previous_FR.json /home/atd-user/atd/Au-temps-donne/atd-api/languages/FR.json)
    if [ "$test" != "" ]; then
        curl "https://api.autempsdonne.lol/api/updateTraductions"
        echo "curl executé"
    else
        echo "Fichiers identiques"
   fi
else
    echo "Création de la backup"
    mkdir /home/atd-user/backup/
fi
cp /home/atd-user/atd/Au-temps-donne/atd-api/languages/FR.json /home/atd-user/backup/previous_FR.json
