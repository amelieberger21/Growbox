export interface Nutrition { energy:number; protein:number; carbohydrates:number; fat:number; fibre:number; basis:string; source:string; sourceName:string; availableCarbohydrates?:boolean; }
const common: Nutrition={energy:17,protein:2.3,carbohydrates:.1,fat:.1,fibre:4,basis:'Frisch, roh · pro 100 g essbarer Anteil. Allgemeiner Artdatensatz für Agaricus bisporus, nicht speziell für die jeweilige Kulturform.',source:'https://matvaretabellen.mattilsynet.io/en/mushroom-common-raw/',sourceName:'Matvaretabellen · Norwegische Lebensmittelbehörde · Food ID 06.062',availableCarbohydrates:true};
const hk=(energy:number,protein:number,carbohydrates:number,fat:number,fibre:number):Nutrition=>({energy,protein,carbohydrates,fat,fibre,basis:'Pro 100 g gemäß Quellentabelle. Die Zubereitungsform wird in dieser Tabelle nicht separat ausgewiesen.',source:'https://restaurant.eatsmart.gov.hk/eng/content.aspx?content_id=853',sourceName:'Department of Health Hong Kong · EatSmart, nach USDA (Stand der Quelle: 2019)'});
export const NUTRITION:Record<string,Nutrition>={
 'weisser-champignon':common,'brauner-champignon':common,
 'austernseitling':hk(33,3.31,6.09,.41,2.3),
 'shiitake':hk(34,2.24,6.79,.49,2.5),
 'enoki':hk(37,2.66,7.81,.29,2.7),
};
