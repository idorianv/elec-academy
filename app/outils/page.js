import Shell from "../_components/Shell";
import Calculateurs from "./Calculateurs";
import { requireActive } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function Outils() {
  const { user, badge } = await requireActive();

  return (
    <Shell user={user} badge={badge}>
      <div className="page-head">
        <span className="eyebrow">Boîte à outils</span>
        <h1 className="h1">Calculs de chantier</h1>
        <p className="dim small" style={{ maxWidth: 580 }}>
          Les quatre calculs qu'on refait tout le temps, utilisables d'une main sur le téléphone. Tu peux revenir ici
          même quand tu ne suis aucun module.
        </p>
      </div>

      <Calculateurs />
    </Shell>
  );
}
