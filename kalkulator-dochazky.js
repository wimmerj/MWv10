// Docházka kalkulátor - JS verze

function casNaMinuty(casStr) {
    casStr = casStr.trim();
    if (casStr.includes(':')) {
        let [hodiny, minuty] = casStr.split(':');
        return parseInt(hodiny) * 60 + parseInt(minuty);
    } else {
        return parseInt(casStr) * 60;
    }
}

function minutyNaCas(minuty) {
    let hodiny = Math.abs(minuty) / 60 | 0;
    let minZbytek = Math.abs(minuty) % 60;
    let znak = minuty < 0 ? '-' : '';
    return `${znak}${hodiny}:${minZbytek.toString().padStart(2, '0')}`;
}

function vypocitatPrestavky() {
    let obedovaPauza = parseInt(document.getElementById('prest1').value) || 0;
    let celkovePrestavky = 0;
    
    // Obědová pauza - první půl hodina se nezapočítává
    if (obedovaPauza > 30) {
        celkovePrestavky += obedovaPauza - 30;
    }
    
    // Ostatní přestávky se počítají celé
    for (let i = 2; i <= 4; i++) {
        celkovePrestavky += parseInt(document.getElementById(`prest${i}`).value) || 0;
    }
    
    return celkovePrestavky;
}

function aktualizovatZpozdeni() {
    const prichodStr = document.getElementById('prichod').value.trim();
    const prichodMinuty = casNaMinuty(prichodStr);
    const spravnyPrichodMinuty = casNaMinuty('6:00');
    const zpozdeniSpan = document.getElementById('zpozdeni');
    if (prichodMinuty > spravnyPrichodMinuty) {
        const zpozdeniMinuty = prichodMinuty - spravnyPrichodMinuty;
        zpozdeniSpan.textContent = `Zpoždění: ${minutyNaCas(zpozdeniMinuty)}`;
        zpozdeniSpan.style.color = 'red';
    } else {
        zpozdeniSpan.textContent = '';
        zpozdeniSpan.style.color = 'black';
    }
}

document.getElementById('prichod').addEventListener('input', aktualizovatZpozdeni);

function vypocitatAktualniStav() {
    const now = new Date();
    const aktualniMinuty = now.getHours() * 60 + now.getMinutes();
    let prichodMinuty = casNaMinuty(document.getElementById('prichod').value);
    let celkovePrestavky = vypocitatPrestavky();
    
    // Počáteční stav (rozdíl do včerejšího dne)
    let pocatecniRozdilStr = document.getElementById('rozdil').value;
    let pocatecniRozdilMinut = casNaMinuty(pocatecniRozdilStr);
    let typRozdilu = document.querySelector('input[name="typ_rozdilu"]:checked').value;
    if (typRozdilu === 'minus') pocatecniRozdilMinut = -pocatecniRozdilMinut;
    
    // Omezení pracovní doby: 6:00 - 18:00
    const zacatekPraceDne = casNaMinuty('6:00');  // 6:00
    const konecPraceDne = casNaMinuty('18:00');   // 18:00
    const standardniDoba = casNaMinuty('14:00') - zacatekPraceDne; // 8 hodin (6:00-14:00)
    
    // Příchod nemůže být před 6:00
    if (prichodMinuty < zacatekPraceDne) {
        prichodMinuty = zacatekPraceDne;
    }
    
    // Aktuální čas nemůže být po 18:00
    let aktualniCasOmezeny = aktualniMinuty;
    if (aktualniCasOmezeny > konecPraceDne) {
        aktualniCasOmezeny = konecPraceDne;
    }
    
    // Odpracováno dnes (od příchodu do teď, minus přestávky, ale max do 18:00)
    let odpracovanoDnesMinut = aktualniCasOmezeny >= prichodMinuty ? aktualniCasOmezeny - prichodMinuty - celkovePrestavky : 0;
    
    // Kolik jsem měl odpracovat do této doby
    let meloByBytOdpracovano = 0;
    if (aktualniMinuty <= zacatekPraceDne) {
        // Ještě nezačala pracovní doba
        meloByBytOdpracovano = 0;
    } else if (aktualniMinuty >= casNaMinuty('14:00')) {
        // Už skončila standardní pracovní doba (14:00)
        meloByBytOdpracovano = standardniDoba;
    } else {
        // Jsme v průběhu standardní pracovní doby
        let ubehloOdZacatku = aktualniMinuty - zacatekPraceDne;
        meloByBytOdpracovano = Math.min(ubehloOdZacatku, standardniDoba);
    }
    
    // Rozdíl mezi tím co jsem odpracoval a co jsem měl odpracovat
    let dnesniRozdil = odpracovanoDnesMinut - meloByBytOdpracovano;
    
    // Celkový rozdíl = včerejší stav + dnešní rozdíl
    let celkovyRozdil = pocatecniRozdilMinut + dnesniRozdil;
    
    const vysledekDiv = document.getElementById('vysledek');
    if (celkovyRozdil >= 0) {
        vysledekDiv.textContent = `Aktuálně v plusu: ${minutyNaCas(celkovyRozdil)}`;
        vysledekDiv.style.color = 'green';
    } else {
        vysledekDiv.textContent = `Aktuálně v minusu: ${minutyNaCas(-celkovyRozdil)}`;
        vysledekDiv.style.color = 'red';
    }
}

function aktualizovatCas() {
    const now = new Date();
    document.getElementById('aktualniCas').textContent = `Aktuální čas: ${now.toLocaleTimeString('cs-CZ')}`;
    vypocitatAktualniStav();
    setTimeout(aktualizovatCas, 1000);
}

aktualizovatCas();

document.getElementById('vypocitat').addEventListener('click', function() {
    try {
        let prichodMinuty = casNaMinuty(document.getElementById('prichod').value);
        let skutecnyPrichodMinuty = prichodMinuty; // Uložíme původní čas pro výpočet doporučeného odchodu
        let odchodMinuty = casNaMinuty(document.getElementById('odchod').value);
        let celkovePrestavky = vypocitatPrestavky();
        let pocatecniRozdilStr = document.getElementById('rozdil').value;
        let pocatecniRozdilMinut = casNaMinuty(pocatecniRozdilStr);
        let typRozdilu = document.querySelector('input[name="typ_rozdilu"]:checked').value;
        if (typRozdilu === 'minus') pocatecniRozdilMinut = -pocatecniRozdilMinut;
        
        // Omezení pracovní doby: 6:00 - 18:00
        const zacatekPraceDne = casNaMinuty('6:00');  // 6:00
        const konecPraceDne = casNaMinuty('18:00');   // 18:00
        const standardniDoba = 480; // 8 hodin
        
        // Příchod před 6:00 se počítá jako 6:00
        if (prichodMinuty < zacatekPraceDne) {
            prichodMinuty = zacatekPraceDne;
        }
        
        // Odchod po 18:00 se pro účely přesčasů počítá jako 18:00
        let odchodOmezeny = odchodMinuty;
        if (odchodOmezeny > konecPraceDne) {
            odchodOmezeny = konecPraceDne;
        }
        
        // Výpočet odpracovaných minut (6:00-18:00)
        let odpracovaneMinuty = odchodOmezeny >= prichodMinuty ? odchodOmezeny - prichodMinuty - celkovePrestavky : 0;
        
        // Pokud byl skutečný odchod po 18:00, ale práce pokračovala přes noc do dalšího dne
        if (odchodMinuty < prichodMinuty && odchodMinuty < zacatekPraceDne) {
            // Přes noc - počítáme pouze do 18:00 předchozího dne
            odpracovaneMinuty = konecPraceDne - prichodMinuty - celkovePrestavky;
        }
        
        let rozdilOdStandardu = odpracovaneMinuty - standardniDoba;
        let celkovyRozdil = rozdilOdStandardu + pocatecniRozdilMinut;
        
        // Nadčasy se počítají pouze po 14:00 ale max do 18:00
        const konecStandardniDoba = casNaMinuty('14:00');
        let nadcasy = 0;
        if (odchodOmezeny > konecStandardniDoba) {
            nadcasy = odchodOmezeny - konecStandardniDoba;
        }
        
        // Výpočet doporučeného času odchodu pro vynulování minusu
        let doporucenyOdchod = '';
        let dodatecneHodiny = '';
        if (celkovyRozdil < 0) {
            let potrebneMinuty = Math.abs(celkovyRozdil);
            // Pro vynulování potřebuji odpracovat: standardní doba + minus z předchozích dnů
            // Čas odchodu = příchod + přestávky + standardní doba + minus z předchozích dnů
            let potrebnaDelkaPrace = standardniDoba + Math.abs(pocatecniRozdilMinut);
            let moznyOdchodMinuty = skutecnyPrichodMinuty + celkovePrestavky + potrebnaDelkaPrace;
            
            if (moznyOdchodMinuty <= konecPraceDne) {
                doporucenyOdchod = `Pro vynulování minusu odejít v: ${minutyNaCas(moznyOdchodMinuty)}`;
            } else {
                // Pro výpočet max možných minut používáme také skutečný příchod, ale alespoň od 6:00
                let prichodProVypocet = Math.max(skutecnyPrichodMinuty, zacatekPraceDne);
                let maxMozneMinuty = konecPraceDne - prichodProVypocet - celkovePrestavky;
                let zbyvajiciMinus = potrebnaDelkaPrace - maxMozneMinuty;
                doporucenyOdchod = `Pro vynulování je třeba pracovat do 18:00`;
                dodatecneHodiny = `Zbývající minus na další dny: ${minutyNaCas(zbyvajiciMinus)}`;
            }
        }
        
        let detailText = [];
        detailText.push(`Příchod: ${document.getElementById('prichod').value}${prichodMinuty !== casNaMinuty(document.getElementById('prichod').value) ? ' (počítáno od 6:00)' : ''}`);
        detailText.push(`Odchod: ${document.getElementById('odchod').value}${odchodOmezeny !== odchodMinuty ? ' (počítáno do 18:00)' : ''}`);
        
        // Detail přestávek
        let obedovaPauza = parseInt(document.getElementById('prest1').value) || 0;
        if (obedovaPauza > 0) {
            if (obedovaPauza <= 30) {
                detailText.push(`Obědová pauza: ${obedovaPauza} min (nezapočítává se)`);
            } else {
                detailText.push(`Obědová pauza: ${obedovaPauza} min (počítá se ${obedovaPauza - 30} min)`);
            }
        }
        if (celkovePrestavky !== (obedovaPauza > 30 ? obedovaPauza - 30 : 0)) {
            detailText.push(`Ostatní přestávky: ${celkovePrestavky - (obedovaPauza > 30 ? obedovaPauza - 30 : 0)} min`);
        }
        detailText.push(`Přestávky celkem: ${celkovePrestavky} min`);
        
        detailText.push(`Odpracováno: ${minutyNaCas(odpracovaneMinuty)}`);
        detailText.push(`Standardní doba: ${minutyNaCas(standardniDoba)}`);
        if (pocatecniRozdilMinut !== 0) {
            let typ = pocatecniRozdilMinut > 0 ? '+' : '';
            detailText.push(`Počáteční rozdíl: ${typ}${minutyNaCas(pocatecniRozdilMinut)}`);
        }
        if (nadcasy > 0) {
            detailText.push(`Nadčasy (po 14:00): ${minutyNaCas(nadcasy)}`);
        }
        if (odchodMinuty > konecPraceDne) {
            let neplacenyNadcas = odchodMinuty - konecPraceDne;
            detailText.push(`Neplácený čas (po 18:00): ${minutyNaCas(neplacenyNadcas)}`);
        }
        if (doporucenyOdchod) {
            detailText.push('');
            detailText.push(doporucenyOdchod);
        }
        if (dodatecneHodiny) {
            detailText.push(dodatecneHodiny);
        }
        
        document.getElementById('detail').textContent = detailText.join('\n');
        
        const vysledekDiv = document.getElementById('vysledek');
        if (celkovyRozdil >= 0) {
            vysledekDiv.textContent = `Celkem v plusu: ${minutyNaCas(celkovyRozdil)}`;
            vysledekDiv.style.color = 'green';
        } else {
            vysledekDiv.textContent = `Celkem v minusu: ${minutyNaCas(-celkovyRozdil)}`;
            vysledekDiv.style.color = 'red';
        }
        const planovanyDiv = document.getElementById('planovanyVysledek');
        if (celkovyRozdil >= 0) {
            planovanyDiv.textContent = `→ Po odchodu v ${document.getElementById('odchod').value} budu v plusu: ${minutyNaCas(celkovyRozdil)}`;
            planovanyDiv.style.color = 'darkgreen';
        } else {
            planovanyDiv.textContent = `→ Po odchodu v ${document.getElementById('odchod').value} budu v minusu: ${minutyNaCas(-celkovyRozdil)}`;
            planovanyDiv.style.color = 'darkred';
        }
    } catch (e) {
        document.getElementById('vysledek').textContent = 'Chyba při výpočtu';
        document.getElementById('detail').textContent = '';
        document.getElementById('planovanyVysledek').textContent = '';
    }
});
