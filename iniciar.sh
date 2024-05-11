#!/bin/sh
echo $(date -d '1 hour ago' +"%d/%m/%Y %H:%M")" - Inicio Manual" >> log_file.txt
while true; do
  node src/index.js
  echo "Si desea detener por completo el proceso del servidor ahora, presione Ctrl + C antes de que se acabe el tiempo."
  echo $(date -d '1 hour ago' +"%d/%m/%Y %H:%M")" - Crash" >> log_file.txt
  echo "Reiniciando en:"
  for i in 5 4 3 2 1; do
    echo "$i..."
    sleep 1
  done
  echo "¡Reiniciando ahora!"
done
