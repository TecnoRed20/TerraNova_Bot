const puppeteer = require('puppeteer');
import MailPackageTracker from '../models/mailPackageTracker'
import eLog from './eLog';
import timestamp from './timestamp';

async function mailPackageTracker(PackageCode) {
  const UrlBase = 'https://www.correos.es/es/es/herramientas/localizador/envios/detalle?tracking-number=';
  const URL = UrlBase + PackageCode;

  // Inicia Puppeteer
  const browser = await puppeteer.launch({
    headless: true, // Ejecución sin interfaz gráfica
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Opcional, pero puede ser necesario en entornos VPS
  });
  const page = await browser.newPage();

  try {
    // Navegar a la URL de seguimiento
    await page.goto(URL, { waitUntil: 'networkidle2' });

    // Espera a que el contenido relevante esté presente (personaliza el selector según el contenido de la página)
    await page.waitForSelector('correos-cdk-shipping-card');

    // Extrae información de la página (modifica según lo que necesites obtener)
    const trackingInfo = await page.evaluate(() => {
      const trackingCard = document.querySelector('correos-cdk-shipping-card');
      const trackNumber = trackingCard.getAttribute('track_number');
      const points = JSON.parse(trackingCard.getAttribute('points'));
      const trackingStates = points.map(point => ({
        title: point.title,
        date: point.date,
        desc: point.desc,
      }));

      return {
        trackNumber,
        trackingStates,
      };
    });

    return trackingInfo;

  } catch (error) {
    console.error("Error al obtener la información del paquete:", error);
  } finally {
    await browser.close();
  }
};

async function run(client, packageCode, intervalId) {
  const trackingInfo = await mailPackageTracker(packageCode)
  // console.log('Información del seguimiento:', trackingInfo);
  // En Entrega
  const stateInDelivery = trackingInfo.trackingStates.find(point => point.title === 'EN ENTREGA');
  if(stateInDelivery && stateInDelivery.date) {
    // Detener el intervalo
    clearInterval(intervalId);
    const mptUpdate = await MailPackageTracker.findOneAndUpdate({packageId: packageCode, expiredAt: null}, {expiredAt: new Date(), intervalId: null},  { new: true })
    eLog('Paquete: ' + packageCode + '\nEn Entrega el', stateInDelivery.date)
    
    // Notificacion a discord
    if(!client) { // Si el cliente ya esta conectado
      return eLog("Cliente no definido...")
    }

    const userId = mptUpdate.userId;
    const user = await client.users.fetch(userId);
    const mdChannel = await user.createDM(true);
    mdChannel.send(`${timestamp()} Su [paquete](https://www.correos.es/es/es/herramientas/localizador/envios/detalle?tracking-number=${packageCode}) ya esta en reparto <@${userId}>`)
  }
  else {
    //eLog("Debugger: No esta disponible el paquete")
  }
}

export default async function startTracking(client, packageCode) {
  const intervalId = setInterval(() => run(client, packageCode, intervalId), 5 * 60 * 1000); // Repite cada 5 minutos

  await MailPackageTracker.updateOne({packageId: packageCode, expiredAt: null}, {intervalId: String(intervalId)})
  run(client, packageCode, intervalId); // Llama inicialmente para empezar
}

