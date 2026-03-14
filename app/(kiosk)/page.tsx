import KioskApp from '../../components/kiosk/KioskApp';
import { getMissions, getSettings } from '../../lib/data';

export const dynamic = 'force-dynamic'; // Ensure we get fresh data on reload

export default async function KioskPage() {
  const missions = await getMissions();
  const settings = await getSettings();

  return <KioskApp initialMissions={missions} initialSettings={settings} />;
}
