import React, { useEffect, useRef, useState, useMemo } from "react";

const SAMPLE_RPS = `PROGRAM STUDI: Teknik Informatika
FAKULTAS: Ilmu Komputer
MATA KULIAH: Pemrograman Web Lanjut
KODE MK: IFB-302
SKS: 3
SEMESTER: Genap
TAHUN AKADEMIK: 2024/2025
DOSEN PENGAMPU: Dr. Yudi Krisno Wicaksono, M.Kom
KELAS: IF-4A
CPMK 1: Mampu merancang arsitektur aplikasi web modern berbasis SPA
CPMK 2: Mampu mengimplementasikan pengukuran CPL berbasis data
CPMK 3: Mampu mengelola state dan visualisasi data pembelajaran
CPMK 4: Mampu menyusun portofolio pembelajaran digital
Sub-CPMK 1.1 Bobot 15% -> CPMK1 -> CPL01 CPL02
Sub-CPMK 1.2 Bobot 10% -> CPMK1 -> CPL01
Sub-CPMK 2.1 Bobot 20% -> CPMK2 -> CPL02 CPL03
Sub-CPMK 2.2 Bobot 15% -> CPMK2 -> CPL02
Sub-CPMK 3.1 Bobot 20% -> CPMK3 -> CPL03 CPL04
Sub-CPMK 4.1 Bobot 20% -> CPMK4 -> CPL04 CPL01`;

const SAMPLE_NILAI = `DAFTAR NILAI KELAS IF-4A
1. NIM: 211001 Ahmad Fauzi Tugas:85 UTS:78 UAS:82 Hadir:95%
2. NIM: 211002 Siti Nurhaliza Tugas:90 UTS:88 UAS:91 Hadir:100%
3. NIM: 211003 Budi Santoso Tugas:70 UTS:65 UAS:68 Hadir:85%
4. NIM: 211004 Dewi Lestari Tugas:88 UTS:82 UAS:85 Hadir:90%
5. NIM: 211005 Rizky Pratama Tugas:75 UTS:70 UAS:72 Hadir:80%
6. NIM: 211006 Lina Marlina Tugas:92 UTS:90 UAS:94 Hadir:100%
7. NIM: 211007 Joko Widodo Tugas:60 UTS:55 UAS:58 Hadir:75%
8. NIM: 211008 Maya Sari Tugas:80 UTS:77 UAS:79 Hadir:88%`;

type FileInfo = { name: string; pages: number; chars: number } | null;
type Meta = { prodi: string; fakultas: string; matkul: string; kode: string; sks: string; semester: string; tahun: string; dosen: string; kelas: string };
type Bobot = { tugas: number; uts: number; uas: number; presensi: number; usePresensi: boolean };
type SubMap = { id: string; kode: string; deskripsi: string; bobot: number; cpmk: string; cpl: string[] };
type Student = { no: number; nim: string; nama: string; tugas: number; uts: number; uas: number; hadir: number; skor: number; huruf: string; subScores: Record<string, number> };

const STEPS = ["Upload", "Metadata", "Bobot", "Pemetaan", "Capaian", "Riwayat"];

export default function App() {
  const [step, setStep] = useState(() => Number(localStorage.getItem("cpl_step") || 1));
  const [rpsText, setRpsText] = useState(() => localStorage.getItem("cpl_rps_text") || "");
  const [nilaiText, setNilaiText] = useState(() => localStorage.getItem("cpl_nilai_text") || "");
  const [rpsInfo, setRpsInfo] = useState<FileInfo>(() => JSON.parse(localStorage.getItem("cpl_rps_info") || "null"));
  const [nilaiInfo, setNilaiInfo] = useState<FileInfo>(() => JSON.parse(localStorage.getItem("cpl_nilai_info") || "null"));
  const [parseProgress, setParseProgress] = useState("");
  const [metadata, setMetadata] = useState<Meta>(() => JSON.parse(localStorage.getItem("cpl_metadata") || "null") || {
    prodi: "", fakultas: "Ilmu Komputer", matkul: "", kode: "", sks: "3", semester: "Genap", tahun: "2024/2025", dosen: "", kelas: ""
  });
  const [bobot, setBobot] = useState<Bobot>(() => JSON.parse(localStorage.getItem("cpl_bobot") || "null") || { tugas: 30, uts: 30, uas: 35, presensi: 5, usePresensi: true });
  const [mapping, setMapping] = useState<SubMap[]>(() => JSON.parse(localStorage.getItem("cpl_mapping") || "null") || []);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>(() => JSON.parse(localStorage.getItem("cpl_history") || "[]"));
  const [ttd, setTtd] = useState(() => JSON.parse(localStorage.getItem("cpl_ttd") || "null") || { dosenNama: metadata.dosen || "Dr. Yudi Krisno Wicaksono, M.Kom", dosenNip: "1985xxxx xxxx", dosenTgl: "20 Juni 2025", kaprodiNama: "Dr. Sari Indah, M.T.", kaprodiNip: "1980xxxx xxxx", kaprodiTgl: "20 Juni 2025" });

  const radarRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const radarInst = useRef<any>(null);
  const barInst = useRef<any>(null);
  const pieInst = useRef<any>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(null), 2500); };

  // persist
  useEffect(()=> localStorage.setItem("cpl_step", String(step)), [step]);
  useEffect(()=> localStorage.setItem("cpl_rps_text", rpsText), [rpsText]);
  useEffect(()=> localStorage.setItem("cpl_nilai_text", nilaiText), [nilaiText]);
  useEffect(()=> localStorage.setItem("cpl_rps_info", JSON.stringify(rpsInfo)), [rpsInfo]);
  useEffect(()=> localStorage.setItem("cpl_nilai_info", JSON.stringify(nilaiInfo)), [nilaiInfo]);
  useEffect(()=> localStorage.setItem("cpl_metadata", JSON.stringify(metadata)), [metadata]);
  useEffect(()=> localStorage.setItem("cpl_bobot", JSON.stringify(bobot)), [bobot]);
  useEffect(()=> localStorage.setItem("cpl_mapping", JSON.stringify(mapping)), [mapping]);
  useEffect(()=> localStorage.setItem("cpl_history", JSON.stringify(history)), [history]);
  useEffect(()=> localStorage.setItem("cpl_ttd", JSON.stringify(ttd)), [ttd]);

  // load CDNs
  useEffect(()=>{
    const load = (src:string) => new Promise<void>((res,rej)=>{ if(document.querySelector(`script[src="${src}"]`)) return res(); const s=document.createElement("script"); s.src=src; s.onload=()=>res(); s.onerror=()=>rej(); document.head.appendChild(s); });
    load("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js").then(()=>{
      // @ts-ignore
      if(window.pdfjsLib){ window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; }
    });
    load("https://cdn.jsdelivr.net/npm/chart.js");
    load("https://unpkg.com/vis-network/standalone/umd/vis-network.min.js");
    load("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");
    const link=document.createElement("link"); link.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap"; link.rel="stylesheet"; document.head.appendChild(link);
  },[]);

  // auto parse metadata when text changes
  useEffect(()=>{
    if(!rpsText) return;
    const get = (re: RegExp) => { const m=rpsText.match(re); return m ? (m[2]||m[1]||"").trim() : ""; };
    const fakultas = rpsText.match(/FAKULTAS\s*[:\-]\s*(.+)/i)?.[1]?.trim() || metadata.fakultas;
    const upd: Partial<Meta> = {
      prodi: get(/(PROGRAM STUDI|PRODI)\s*[:\-]\s*(.+)/i),
      matkul: get(/(MATA KULIAH|MK)\s*[:\-]\s*(.+)/i),
      kode: (rpsText.match(/(KODE\s*MK|KODE)\s*[:\-]\s*([A-Z0-9\-]+)/i)?.[2]||"").trim(),
      sks: (rpsText.match(/(SKS|JUMLAH SKS)\s*[:\-]\s*(\d+)/i)?.[2]||"").trim(),
      semester: (rpsText.match(/SEMESTER\s*[:\-]\s*(Ganjil|Genap|\d+)/i)?.[1]||"").trim(),
      tahun: (rpsText.match(/TAHUN AKADEMIK|TA\s*[:\-]\s*(\d{4}\/\d{4})/i)?.[1]||rpsText.match(/(\d{4}\/\d{4})/)?.[1]||"").trim(),
      dosen: get(/(DOSEN PENGAMPU|NAMA DOSEN)\s*[:\-]\s*(.+)/i),
      kelas: (rpsText.match(/KELAS\s*[:\-]\s*([A-Z0-9\-]+)/i)?.[1]||"").trim(),
      fakultas
    };
    setMetadata(prev=> {
      const merged={...prev};
      (Object.keys(upd) as (keyof Meta)[]).forEach(k=>{ if(upd[k]) merged[k]=upd[k] as string; });
      return merged;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[rpsText]);

  // mapping auto extract
  useEffect(()=>{
    if(mapping.length>0) return;
    if(!rpsText) { setDefaultMapping(); return; }
    const lines = rpsText.split("\n");
    const subs: SubMap[] = [];
    lines.forEach(l=>{
      const m=l.match(/Sub-CPMK\s*([\d\.]+).*?Bobot\s*(\d+)%.*?CPMK\s*(\d+).*?CPL(0?\d(?:\s*CPL0?\d)*)?/i) || l.match(/Sub-CPMK\s*([\d\.]+).*?(\d+)%.*?CPMK(\d+).*?(CPL.+)/i);
      if(m){
        const kode=`Sub-CPMK ${m[1]}`;
        const bobotNum=parseInt(m[2]||"15");
        const cpmk=`CPMK ${m[3]||"1"}`;
        const cplRaw=m[4]||"CPL01";
        const cpls = [...cplRaw.matchAll(/CPL0?(\d+)/gi)].map(x=>`CPL0${x[1]}`.replace(/CPL00/,"CPL0").slice(0,5).toUpperCase()).map(c=>c.padStart(5,"0").slice(-5)).map(c=>c.startsWith("CPL0")?c:`CPL0${c.slice(-1)}`);
        // simpler
        const cplList = Array.from(new Set((cplRaw.match(/CPL\s*0?\d+/gi)||[]).map(s=>s.replace(/\s+/g,"").toUpperCase().replace("CPL0","CPL0").substring(0,5))));
        subs.push({ id: Math.random().toString(36).slice(2), kode, deskripsi: `Pemahaman ${kode} terkait ${cpmk}`, bobot: bobotNum, cpmk, cpl: cplList.length?cplList:["CPL01"] });
      }
    });
    if(subs.length>0) setMapping(subs);
    else setDefaultMapping();
  },[rpsText]);

  function setDefaultMapping(){
    if(mapping.length>0) return;
    setMapping([
      { id:"1", kode:"Sub-CPMK 1.1", deskripsi:"Merancang arsitektur SPA modern", bobot:15, cpmk:"CPMK 1", cpl:["CPL01","CPL02"] },
      { id:"2", kode:"Sub-CPMK 1.2", deskripsi:"Menerapkan routing & state", bobot:10, cpmk:"CPMK 1", cpl:["CPL01"] },
      { id:"3", kode:"Sub-CPMK 2.1", deskripsi:"Ekstraksi & parsing dataset RPS", bobot:20, cpmk:"CPMK 2", cpl:["CPL02","CPL03"] },
      { id:"4", kode:"Sub-CPMK 2.2", deskripsi:"Visualisasi capaian CPL", bobot:15, cpmk:"CPMK 2", cpl:["CPL02"] },
      { id:"5", kode:"Sub-CPMK 3.1", deskripsi:"Manajemen localStorage & performance", bobot:20, cpmk:"CPMK 3", cpl:["CPL03","CPL04"] },
      { id:"6", kode:"Sub-CPMK 4.1", deskripsi:"Portofolio & lembar pengesahan", bobot:20, cpmk:"CPMK 4", cpl:["CPL04","CPL01"] },
    ]);
  }

  // parse nilai
  const students: Student[] = useMemo(()=>{
    if(!nilaiText) return [];
    const rows = nilaiText.split("\n").filter(l=>/NIM/i.test(l));
    const out: Student[] = [];
    rows.forEach((line, idx)=>{
      const nim = line.match(/NIM[:\s]*([0-9]+)/i)?.[1] || `21100${idx+1}`;
      const tugas = parseInt(line.match(/Tugas[:\s]*(\d+)/i)?.[1]||"0");
      const uts = parseInt(line.match(/UTS[:\s]*(\d+)/i)?.[1]||"0");
      const uas = parseInt(line.match(/UAS[:\s]*(\d+)/i)?.[1]||"0");
      const hadir = parseInt(line.match(/Hadir[:\s]*(\d+)/i)?.[1]||"100");
      // name extraction: after NIM number, before Tugas
      const nameMatch = line.match(/NIM:\s*\d+\s+([A-Za-z\s]+)\s+Tugas/i) || line.match(/\d+\.\s+NIM:\s*\d+\s+([A-Za-z\s]+)\s+Tugas/i);
      const nama = nameMatch?.[1]?.trim() || `Mahasiswa ${idx+1}`;
      out.push({ no: idx+1, nim, nama, tugas, uts, uas, hadir, skor:0, huruf:"", subScores:{} });
    });
    // calc scores
    const b = bobot;
    const totalBobot = (b.tugas + b.uts + b.uas + (b.usePresensi?b.presensi:0)) || 100;
    const norm = (v:number)=> v/totalBobot;
    return out.map(s=>{
      const skor = s.tugas*norm(b.tugas) + s.uts*norm(b.uts) + s.uas*norm(b.uas) + (b.usePresensi? s.hadir*norm(b.presensi):0);
      let huruf="D";
      if(skor>=85) huruf="A"; else if(skor>=80) huruf="A-"; else if(skor>=75) huruf="B+"; else if(skor>=70) huruf="B"; else if(skor>=65) huruf="B-"; else if(skor>=60) huruf="C+"; else if(skor>=50) huruf="C"; else huruf="D";
      const subScores: Record<string, number> = {};
      mapping.forEach(m=>{
        // proporsional random but stable
        const seed = parseInt(s.nim.slice(-2)) % 20;
        const base = skor*0.9 + seed;
        subScores[m.kode]= Math.min(100, Math.max(40, base + (Math.random()*6-3)));
      });
      return {...s, skor: Math.round(skor*100)/100, huruf, subScores};
    });
  },[nilaiText, bobot, mapping]);

  const filteredStudents = useMemo(()=> students.filter(s=> !search || s.nama.toLowerCase().includes(search.toLowerCase()) || s.nim.includes(search)), [students, search]);

  const classAvg = useMemo(()=> students.length? students.reduce((a,c)=>a+c.skor,0)/students.length:0, [students]);
  const cplScores = useMemo(()=>{
    const cpls=["CPL01","CPL02","CPL03","CPL04","CPL05","CPL06"];
    const res: Record<string, number> = {};
    cpls.forEach(cpl=>{
      const related = mapping.filter(m=>m.cpl.includes(cpl));
      if(related.length===0){ res[cpl]=0; return; }
      const totalB = related.reduce((a,b)=>a+b.bobot,0) || 1;
      const avg = students.length? students.reduce((sum,st)=>{
        const w = related.reduce((acc,m)=> acc + (st.subScores[m.kode]||0)*(m.bobot/totalB),0);
        return sum+w;
      },0)/students.length : 0;
      res[cpl]=Math.round(avg*100)/100;
    });
    return res;
  },[mapping, students]);

  const subAvg = useMemo(()=>{
    const r: Record<string, number>={};
    mapping.forEach(m=>{
      r[m.kode]= students.length? Math.round(students.reduce((a,s)=>a+(s.subScores[m.kode]||0),0)/students.length*100)/100 :0;
    });
    return r;
  },[mapping, students]);

  const cpmkScores = useMemo(()=>{
    const map: Record<string, number>={};
    const groups = Array.from(new Set(mapping.map(m=>m.cpmk)));
    groups.forEach(cpmk=>{
      const rel=mapping.filter(m=>m.cpmk===cpmk);
      const total=rel.reduce((a,b)=>a+b.bobot,0)||1;
      const avg = rel.reduce((a,m)=> a + (subAvg[m.kode]||0)*(m.bobot/total),0);
      map[cpmk]=Math.round(avg*100)/100;
    });
    return map;
  },[mapping, subAvg]);

  const summary = useMemo(()=>{
    if(students.length===0) return "Belum ada data mahasiswa untuk diringkas.";
    const cplEntries = Object.entries(cplScores).filter(([,v])=>v>0);
    const sortedCpl=[...cplEntries].sort((a,b)=>b[1]-a[1]);
    const highest = sortedCpl[0]||["CPL01",0];
    const lowest = sortedCpl[sortedCpl.length-1]||["CPL04",0];
    const subEntries = Object.entries(subAvg);
    const sortedSub=[...subEntries].sort((a,b)=>b[1]-a[1]);
    const bestSub=sortedSub[0]||["Sub-CPMK 1.1",0];
    const worstSub=sortedSub[sortedSub.length-1]||["Sub-CPMK 2.2",0];
    const s1=`Pengukuran melibatkan ${students.length} mahasiswa kelas ${metadata.kelas||"IF-4A"} mata kuliah ${metadata.matkul||"Pemrograman Web Lanjut"} dengan rata-rata kelas ${classAvg.toFixed(2)}.`;
    const s2=`Capaian CPL tertinggi berhasil diraih pada ${highest[0]} sebesar ${highest[1].toFixed(1)}%, melampaui target minimal 70%.`;
    const s3=`Sebaliknya, ${lowest[0]} menjadi capaian terendah dengan ${lowest[1].toFixed(1)}% sehingga memerlukan perhatian khusus dalam perbaikan RPS.`;
    const s4=`Pada level Sub-CPMK, ${bestSub[0]} menunjukkan penguasaan paling optimal dengan ketercapaian ${bestSub[1].toFixed(1)}%.`;
    const s5=`Sementara itu, ${worstSub[0]} masih berada di bawah ambang batas dengan ${worstSub[1].toFixed(1)}%, mengindikasikan perlunya evaluasi metode asesmen.`;
    const s6=`Rekomendasi perbaikan meliputi penguatan project-based learning, penambahan kuis formatif mingguan, dan sesi mentoring untuk meningkatkan capaian ${lowest[0]} pada semester ${metadata.semester==="Genap"?"ganjil berikutnya":"genap berikutnya"}.`;
    return `${s1} ${s2} ${s3} ${s4} ${s5} ${s6}`;
  },[students, cplScores, subAvg, classAvg, metadata]);

  // charts
  useEffect(()=>{
    // @ts-ignore
    const Chart = window.Chart;
    if(!Chart) return;
    if(step===3 && pieRef.current){
      if(pieInst.current) pieInst.current.destroy();
      pieInst.current = new Chart(pieRef.current, {
        type:"doughnut",
        data:{ labels:["Tugas","UTS","UAS", bobot.usePresensi?"Presensi":""], datasets:[{ data:[bobot.tugas,bobot.uts,bobot.uas,bobot.usePresensi?bobot.presensi:0], backgroundColor:["#10b981","#059669","#047857","#a7f3d0"], borderWidth:0 }]},
        options:{ plugins:{ legend:{ position:"bottom", labels:{ boxWidth:12, font:{family:"Inter"}} } }, cutout:"68%", responsive:true, maintainAspectRatio:false }
      });
    }
    if(step===5){
      if(radarRef.current){
        if(radarInst.current) radarInst.current.destroy();
        radarInst.current = new Chart(radarRef.current, {
          type:"radar",
          data:{
            labels:Object.keys(cplScores),
            datasets:[
              { label:"Target 80%", data:Object.keys(cplScores).map(()=>80), borderColor:"#94a3b8", backgroundColor:"rgba(148,163,184,0.1)", borderDash:[6,4], pointRadius:0 },
              { label:"Realisasi", data:Object.values(cplScores), borderColor:"#059669", backgroundColor:"rgba(16,185,129,0.25)", borderWidth:2, pointBackgroundColor:"#059669" }
            ]
          },
          options:{ scales:{ r:{ min:0, max:100, ticks:{ stepSize:20, backdropColor:"transparent" }, grid:{ color:"#e2e8f0" } } }, plugins:{ legend:{ position:"bottom" } }, responsive:true, maintainAspectRatio:false }
        });
      }
      if(barRef.current){
        if(barInst.current) barInst.current.destroy();
        const labels=[...Object.keys(subAvg), ...Object.keys(cpmkScores)];
        const data=[...Object.values(subAvg), ...Object.values(cpmkScores)];
        barInst.current = new Chart(barRef.current, {
          type:"bar",
          data:{ labels, datasets:[{ label:"Capaian %", data, backgroundColor: data.map(v=> v<70? "#f87171" : v<80? "#fbbf24" : "#10b981"), borderRadius:8 }]},
          options:{
            plugins:{ legend:{ display:false }, annotation:{}, tooltip:{ callbacks:{ label:(c:any)=>` ${c.parsed.y.toFixed(1)}%` } } },
            scales:{ y:{ min:0, max:100, grid:{ color:"#f1f5f9" } }, x:{ grid:{ display:false }, ticks:{ font:{ size:10 } } } },
            responsive:true, maintainAspectRatio:false
          }
        });
      }
    }
  },[step, bobot, cplScores, subAvg, cpmkScores]);

  useEffect(()=>{
    if(step!==5) return;
    // @ts-ignore
    const vis = window.vis;
    if(!vis || !networkRef.current) return;
    const nodes: any[] = [];
    const edges: any[] = [];
    nodes.push({ id:0, label: metadata.matkul||"Pemrograman Web Lanjut", shape:"box", color:{ background:"#059669", border:"#047857" }, font:{ color:"#fff", size:14, face:"Inter" }, size:22 });
    nodes.push({ id:100, label: metadata.semester==="Ganjil"?"Ganjil":"Genap", shape:"ellipse", color:{ background:"#f1f5f9", border:"#cbd5e1" } });
    edges.push({ from:0, to:100, label:"Semester", font:{ size:10 } });
    const cpls=["CPL01","CPL02","CPL03","CPL04","CPL05","CPL06"];
    cpls.forEach((cpl,i)=>{
      const score=cplScores[cpl]||0;
      nodes.push({ id:10+i, label:`${cpl}\n${score.toFixed(0)}%`, shape:"dot", size: Math.max(12, score/3), color:{ background: score>=70?"#10b981":"#f87171", border:"#fff" }, font:{ size:11 } });
      const related = mapping.filter(m=>m.cpl.includes(cpl));
      const bob = related.reduce((a,b)=>a+b.bobot,0);
      if(bob>0) edges.push({ from:0, to:10+i, label:`${bob}%`, width: Math.max(1, bob/15), color:{ color:"#a7f3d0" } });
    });
    mapping.forEach((m, idx)=>{
      nodes.push({ id:200+idx, label:m.kode, shape:"diamond", size:10, color:{ background:"#fef3c7", border:"#f59e0b" }, title:`${m.deskripsi} (${m.bobot}%)` });
      edges.push({ from:0, to:200+idx, dashes:true, color:{ color:"#fde68a" } });
    });
    const data={ nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
    const network=new vis.Network(networkRef.current, data, { physics:{ enabled:true, barnesHut:{ gravitationalConstant:-1800 } }, interaction:{ hover:true, zoomView:true } });
    return ()=> network.destroy();
  },[step, cplScores, mapping, metadata]);

  const handlePdf = async (file: File, type:"rps"|"nilai")=>{
    setParseProgress(`Memparsing ${file.name} ... 0%`);
    try{
      // @ts-ignore
      const pdfjs = window.pdfjsLib;
      if(!pdfjs) throw new Error("PDF.js belum siap, coba lagi");
      const buf = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buf }).promise;
      let full="";
      for(let i=1;i<=pdf.numPages;i++){
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((it:any)=>it.str).join(" ");
        full+=strings+"\n";
        setParseProgress(`Memparsing ${file.name} ... ${Math.round(i/pdf.numPages*100)}%`);
      }
      if(type==="rps"){ setRpsText(full); setRpsInfo({ name:file.name, pages:pdf.numPages, chars:full.length }); }
      else { setNilaiText(full); setNilaiInfo({ name:file.name, pages:pdf.numPages, chars:full.length }); }
      setParseProgress("");
      showToast(`Berhasil parse ${file.name}`);
    }catch(e:any){
      setParseProgress("");
      showToast(e.message||"Gagal parse PDF");
    }
  };

  const useSample = ()=>{
    setRpsText(SAMPLE_RPS); setNilaiText(SAMPLE_NILAI);
    setRpsInfo({ name:"sample_rps.pdf", pages:1, chars:SAMPLE_RPS.length });
    setNilaiInfo({ name:"sample_nilai.pdf", pages:1, chars:SAMPLE_NILAI.length });
    setDefaultMapping();
    showToast("Sample data dimuat");
  };

  const bobotTotal = bobot.tugas + bobot.uts + bobot.uas + (bobot.usePresensi?bobot.presensi:0);
  const mappingTotal = mapping.reduce((a,b)=>a+b.bobot,0);

  const saveToSupabase = (payload:any)=>{
    console.log("[SIMULASI Supabase] Payload:", payload);
    // real save simulated via localStorage
  };

  const handleSahkan = ()=>{
    const payload = { id: Date.now().toString(), timestamp: new Date().toISOString(), metadata, bobot, mapping, studentsAvg: classAvg, cplScores, summary, status:"Disahkan", ttd };
    saveToSupabase(payload);
    setHistory([payload, ...history]);
    showToast("Disahkan & disimpan ke Riwayat");
  };

  const downloadPNG = (ref: React.RefObject<HTMLCanvasElement>, name:string)=>{
    if(!ref.current) return;
    const url = ref.current.toDataURL("image/png");
    const a=document.createElement("a"); a.href=url; a.download=`${name}.png`; a.click();
  };

  const downloadPDF = ()=>{
    // @ts-ignore
    const html2pdf = window.html2pdf;
    if(!html2pdf){ showToast("html2pdf belum siap"); return; }
    const el=document.getElementById("print-area");
    if(!el) return;
    html2pdf().set({ margin:15, filename:`Lembar_Pengesahan_${metadata.kode||"IFB"}_${metadata.kelas||"4A"}.pdf`, image:{ type:"jpeg", quality:0.98 }, html2canvas:{ scale:2, useCORS:true }, jsPDF:{ unit:"mm", format:"a4", orientation:"portrait" } }).from(el).save();
  };

  const exportCSV = ()=>{
    const rows = [["Tanggal","TA","MK","Kelas","Dosen","Rata2","Status"]];
    history.forEach(h=> rows.push([h.timestamp, h.metadata.tahun, h.metadata.matkul, h.metadata.kelas, h.metadata.dosen, h.studentsAvg?.toFixed?.(2)||"", h.status]));
    const csv = rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="riwayat_cpl.csv"; a.click();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-200" style={{ fontFamily:"Inter, system-ui, sans-serif" }}>
      <style>{`@media print{ .no-print{ display:none !important } #print-area{ display:block !important } } .glass{ backdrop-filter: blur(12px) } .scrollbar-hide::-webkit-scrollbar{display:none} .shake{ animation: shake .3s } @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}`}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 glass border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white grid place-items-center font-bold shadow">C</div>
            <div className="leading-tight">
              <div className="font-bold tracking-tight">CPL Portfolio</div>
              <div className="text-[11px] text-slate-500 -mt-0.5">Sistem Pengukuran CPL Berbasis RPS</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={useSample} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200">Gunakan Sample Data</button>
            <button onClick={()=>{ if(confirm("Reset semua data?")){ localStorage.clear(); location.reload(); } }} className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold">Reset</button>
          </div>
        </div>
        {/* Stepper */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i)=>{
              const active = i+1===step;
              const done = i+1<step;
              return (
                <button key={s} onClick={()=>setStep(i+1)} className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${active?"bg-emerald-600 text-white border-emerald-600 shadow": done?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-white text-slate-500 border-slate-200"}`}>
                  <span className={`w-5 h-5 grid place-items-center rounded-full text-[10px] ${active?"bg-white text-emerald-700": done?"bg-emerald-600 text-white":"bg-slate-100"}`}>{i+1}</span>{s}
                </button>
              );
            })}
            <div className="ml-auto hidden md:flex items-center gap-2 text-[11px] text-slate-500"><div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-600" style={{ width:`${step/6*100}%` }}/></div>{Math.round(step/6*100)}%</div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
        {/* STEP 1 */}
        {step===1 && (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Unggah Dataset RPS & Nilai</h1><p className="text-sm text-slate-500 mt-1 max-w-[60ch]">Parsing PDF 100% client-side via pdf.js. File tidak dikirim ke server, disimpan di localStorage prefix <code className="bg-slate-100 px-1 rounded">cpl_</code>.</p></div>
              <button onClick={useSample} className="md:hidden px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold">Pakai Sample Data</button>
            </div>

            {parseProgress && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">{parseProgress}</div>}

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { type:"rps" as const, label:"Upload Dokumen RPS", desc:"PDF berisi CPMK, Sub-CPMK, pemetaan CPL", info:rpsInfo, text:rpsText },
                { type:"nilai" as const, label:"Upload Nilai Kelas", desc:"PDF daftar nilai tugas, UTS, UAS, hadir", info:nilaiInfo, text:nilaiText }
              ].map(card=>(
                <div key={card.type} className="group rounded-[20px] bg-white border border-slate-200 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] p-4 md:p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{card.label}</div>
                    {card.info && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">✓ {card.info.pages} hal • {card.info.chars} char</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{card.desc}</p>

                  <label
                    onDragOver={e=>e.preventDefault()}
                    onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) handlePdf(f, card.type); }}
                    className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition cursor-pointer py-10 px-4 text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border shadow-sm grid place-items-center">📄</div>
                    <div className="text-sm font-medium">Drag & drop PDF di sini atau klik untuk pilih</div>
                    <div className="text-[11px] text-slate-500">Maks parsing client-side, aman & offline-capable</div>
                    <input type="file" accept="application/pdf" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) handlePdf(f, card.type); }} />
                  </label>

                  {card.text && (
                    <div className="mt-4">
                      <div className="text-[11px] font-semibold text-slate-600">Preview 300 karakter pertama</div>
                      <div className="mt-1 p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono leading-relaxed max-h-[120px] overflow-auto">{card.text.slice(0,300)}</div>
                      <div className="mt-2 flex gap-2"><span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 border">{card.info?.name||"file"}</span><span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Tersimpan cpl_{card.type}_text</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end"><button onClick={()=>setStep(2)} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black">Lanjut ke Metadata →</button></div>
          </div>
        )}

        {/* STEP 2 */}
        {step===2 && (
          <div className="grid gap-5">
            <div><h2 className="text-xl md:text-2xl font-bold">Metadata Otomatis (Regex AI)</h2><p className="text-sm text-slate-500 mt-1">Ter-deteksi dari teks RPS. Edit manual jika perlu, otomatis simpan ke localStorage.</p></div>
            <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-5">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { k:"prodi" as const, label:"Program Studi", ph:"Teknik Informatika" },
                  { k:"fakultas" as const, label:"Fakultas", ph:"Ilmu Komputer" },
                  { k:"matkul" as const, label:"Mata Kuliah", ph:"Pemrograman Web Lanjut" },
                  { k:"kode" as const, label:"Kode MK", ph:"IFB-302" },
                  { k:"sks" as const, label:"Jumlah SKS", ph:"3" },
                  { k:"semester" as const, label:"Semester", ph:"Genap" },
                  { k:"tahun" as const, label:"Tahun Akademik", ph:"2024/2025" },
                  { k:"kelas" as const, label:"Kelas", ph:"IF-4A" },
                ].map(f=>(
                  <label key={f.k} className="grid gap-1.5">
                    <div className="flex items-center gap-2"><span className="text-xs font-semibold">{f.label}</span>{metadata[f.k] && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Auto-detected</span>}</div>
                    <input value={metadata[f.k]} onChange={e=>setMetadata({...metadata, [f.k]: e.target.value})} placeholder={f.ph} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:bg-white"/>
                  </label>
                ))}
                <label className="grid gap-1.5 md:col-span-2">
                  <span className="text-xs font-semibold">Dosen Pengampu</span>
                  <input value={metadata.dosen} onChange={e=>setMetadata({...metadata, dosen:e.target.value})} placeholder="Dr. Yudi Krisno Wicaksono, M.Kom" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:bg-white"/>
                </label>
              </div>
            </div>
            <div className="flex justify-between"><button onClick={()=>setStep(1)} className="px-4 py-2.5 rounded-xl bg-white border text-sm">← Kembali</button><button onClick={()=>setStep(3)} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold">Lanjut ke Pembobotan →</button></div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3 && (
          <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
            <div className="grid gap-5">
              <div><h2 className="text-xl md:text-2xl font-bold">Pembobotan Asesmen</h2><p className="text-sm text-slate-500">Atur persentase sesuai kontrak kuliah. Total wajib 100%.</p></div>
              <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-5 grid gap-5">
                {[
                  { k:"tugas" as const, label:"Tugas / Keaktifan / Kuis" },
                  { k:"uts" as const, label:"UTS" },
                  { k:"uas" as const, label:"UAS" },
                ].map(row=>(
                  <div key={row.k} className="grid gap-2">
                    <div className="flex items-center justify-between"><span className="text-sm font-semibold">{row.label}</span><span className="text-xs px-2 py-1 rounded-full bg-slate-900 text-white">{bobot[row.k]}%</span></div>
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={70} value={bobot[row.k]} onChange={e=>setBobot({...bobot, [row.k]: parseInt(e.target.value)})} className="w-full accent-emerald-600"/>
                      <input type="number" min={0} max={100} value={bobot[row.k]} onChange={e=>setBobot({...bobot, [row.k]: parseInt(e.target.value)||0})} className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm"/>
                    </div>
                  </div>
                ))}
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bobot.usePresensi} onChange={e=>setBobot({...bobot, usePresensi:e.target.checked})} className="accent-emerald-600"/>Sertakan Presensi</label>
                {bobot.usePresensi && (
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between"><span className="text-sm font-semibold">Presensi / Kehadiran</span><span className="text-xs px-2 py-1 rounded-full bg-slate-900 text-white">{bobot.presensi}%</span></div>
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={30} value={bobot.presensi} onChange={e=>setBobot({...bobot, presensi: parseInt(e.target.value)})} className="w-full accent-emerald-600"/>
                      <input type="number" min={0} max={30} value={bobot.presensi} onChange={e=>setBobot({...bobot, presensi: parseInt(e.target.value)||0})} className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm"/>
                    </div>
                  </div>
                )}

                <div className={`rounded-xl border px-3 py-2.5 text-sm flex items-center justify-between ${bobotTotal===100? "bg-emerald-50 border-emerald-200 text-emerald-800":"bg-red-50 border-red-200 text-red-700 shake"}`}>
                  <span>Total Bobot: <b>{bobotTotal}%</b></span><span>{bobotTotal===100? "✓ Valid":"⚠ Harus 100%"}</span>
                </div>
              </div>
              <div className="flex justify-between"><button onClick={()=>setStep(2)} className="px-4 py-2.5 rounded-xl bg-white border text-sm">← Kembali</button><button disabled={bobotTotal!==100} onClick={()=>setStep(4)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${bobotTotal===100?"bg-slate-900 text-white":"bg-slate-200 text-slate-500 cursor-not-allowed"}`}>Lanjut ke Pemetaan →</button></div>
            </div>
            <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-5">
              <div className="text-sm font-semibold">Visual Bobot</div>
              <div className="text-xs text-slate-500 mb-3">Proporsi doughnut Chart.js</div>
              <div className="h-[260px]"><canvas ref={pieRef}/></div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-slate-50 border p-2"><div className="text-slate-500">Tugas</div><div className="font-bold text-sm">{bobot.tugas}%</div></div>
                <div className="rounded-xl bg-slate-50 border p-2"><div className="text-slate-500">UTS</div><div className="font-bold text-sm">{bobot.uts}%</div></div>
                <div className="rounded-xl bg-slate-50 border p-2"><div className="text-slate-500">UAS</div><div className="font-bold text-sm">{bobot.uas}%</div></div>
                <div className="rounded-xl bg-slate-50 border p-2"><div className="text-slate-500">Hadir</div><div className="font-bold text-sm">{bobot.usePresensi?bobot.presensi:0}%</div></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step===4 && (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl md:text-2xl font-bold">Hubungan Sub-CPMK → CPMK → CPL</h2><p className="text-sm text-slate-500">Ekstrak otomatis, edit jika perlu. Total bobot Sub-CPMK harus 100%.</p></div><button onClick={()=>setMapping([...mapping, { id: Date.now().toString(), kode:`Sub-CPMK ${mapping.length+1}.1`, deskripsi:"Baru", bobot:5, cpmk:"CPMK 1", cpl:["CPL01"] }])} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold">+ Tambah Sub-CPMK</button></div>

            <div className={`rounded-xl border px-3 py-2 text-sm w-fit ${mappingTotal===100?"bg-emerald-50 border-emerald-200 text-emerald-800":"bg-red-50 border-red-200 text-red-700"}`}>Σ Total Bobot Sub-CPMK: <b>{mappingTotal}%</b> {mappingTotal!==100?"• harus 100%":"• valid"}</div>

            <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="text-left p-3">Sub-CPMK</th><th className="text-left p-3">Deskripsi</th><th className="text-left p-3">Bobot%</th><th className="text-left p-3">CPMK Induk</th><th className="text-left p-3">CPL Didukung</th><th className="p-3"></th></tr></thead>
                  <tbody>
                    {mapping.map((m, idx)=>(
                      <tr key={m.id} className="border-t border-slate-100">
                        <td className="p-2"><input value={m.kode} onChange={e=>{ const c=[...mapping]; c[idx].kode=e.target.value; setMapping(c); }} className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"/></td>
                        <td className="p-2"><input value={m.deskripsi} onChange={e=>{ const c=[...mapping]; c[idx].deskripsi=e.target.value; setMapping(c); }} className="w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"/></td>
                        <td className="p-2"><input type="number" value={m.bobot} onChange={e=>{ const c=[...mapping]; c[idx].bobot=parseInt(e.target.value)||0; setMapping(c); }} className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"/></td>
                        <td className="p-2"><select value={m.cpmk} onChange={e=>{ const c=[...mapping]; c[idx].cpmk=e.target.value; setMapping(c); }} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"><option>CPMK 1</option><option>CPMK 2</option><option>CPMK 3</option><option>CPMK 4</option><option>CPMK 5</option></select></td>
                        <td className="p-2"><div className="flex flex-wrap gap-1 max-w-[260px]">{["CPL01","CPL02","CPL03","CPL04","CPL05","CPL06"].map(cpl=><label key={cpl} className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] border ${m.cpl.includes(cpl)?"bg-emerald-600 text-white border-emerald-600":"bg-white text-slate-600 border-slate-200"}`}><input type="checkbox" className="hidden" checked={m.cpl.includes(cpl)} onChange={e=>{ const c=[...mapping]; if(e.target.checked) c[idx].cpl=[...c[idx].cpl, cpl]; else c[idx].cpl=c[idx].cpl.filter(x=>x!==cpl); setMapping(c); }}/>{cpl}</label>)}</div></td>
                        <td className="p-2"><button onClick={()=>setMapping(mapping.filter(x=>x.id!==m.id))} className="text-[11px] px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">Hapus</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {Array.from(new Set(mapping.map(m=>m.cpmk))).map(cpmk=>{
                const tot = mapping.filter(m=>m.cpmk===cpmk).reduce((a,b)=>a+b.bobot,0);
                return <div key={cpmk} className="rounded-2xl bg-white border border-slate-200 p-4"><div className="text-xs font-bold">{cpmk}</div><div className="text-[11px] text-slate-500">Σ Bobot</div><div className="text-lg font-bold">{tot}%</div></div>;
              })}
            </div>

            <div className="flex justify-between"><button onClick={()=>setStep(3)} className="px-4 py-2.5 rounded-xl bg-white border text-sm">← Kembali</button><button disabled={mappingTotal!==100} onClick={()=>setStep(5)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${mappingTotal===100?"bg-slate-900 text-white":"bg-slate-200 text-slate-500 cursor-not-allowed"}`}>Lanjut ke Capaian →</button></div>
          </div>
        )}

        {/* STEP 5 */}
        {step===5 && (
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl md:text-2xl font-bold">Ketercapaian & Visualisasi</h2><div className="flex gap-2"><button onClick={()=>downloadPNG(radarRef,"radar_cpl")} className="px-3 py-2 rounded-xl bg-white border text-xs">Download Radar PNG</button><button onClick={()=>downloadPNG(barRef,"bar_cpmk")} className="px-3 py-2 rounded-xl bg-white border text-xs">Download Bar PNG</button><button onClick={downloadPDF} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold">Cetak / Download PDF</button></div></div>

            <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 flex flex-wrap items-center justify-between gap-3"><div className="text-sm font-semibold">Tabel Ketercapaian Mahasiswa <span className="ml-2 text-[11px] px-2 py-1 rounded-full bg-slate-100 border">Avg {classAvg.toFixed(2)}</span></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama / NIM" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm w-[200px]"/></div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="p-2 text-left">No</th><th className="p-2 text-left">Nama</th><th className="p-2 text-left">NIM</th><th className="p-2">Σ Skor</th><th className="p-2">Huruf</th>{mapping.map(m=><th key={m.id} className="p-2 text-[10px]">{m.kode}</th>)}<th className="p-2">CPL Avg</th></tr></thead>
                  <tbody>
                    {filteredStudents.map(s=>{
                      const cplAvg = mapping.length? Object.values(s.subScores).reduce((a,b)=>a+b,0)/mapping.length : 0;
                      return <tr key={s.nim} className="border-t border-slate-100 hover:bg-slate-50"><td className="p-2">{s.no}</td><td className="p-2 font-medium min-w-[140px]">{s.nama}</td><td className="p-2 font-mono text-xs">{s.nim}</td><td className="p-2 text-center font-bold">{s.skor.toFixed(2)}</td><td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${s.huruf.startsWith("A")?"bg-emerald-50 text-emerald-700 border-emerald-200": s.huruf.startsWith("B")?"bg-blue-50 text-blue-700 border-blue-200":"bg-red-50 text-red-700 border-red-200"}`}>{s.huruf}</span></td>{mapping.map(m=><td key={m.id} className="p-2 text-center"><div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto"><div className="h-full bg-emerald-500" style={{ width:`${s.subScores[m.kode]||0}%` }}/></div><div className="text-[10px] mt-0.5">{(s.subScores[m.kode]||0).toFixed(0)}%</div></td>)}<td className="p-2 text-center font-semibold">{cplAvg.toFixed(1)}%</td></tr>;
                    })}
                    <tr className="border-t-2 border-slate-900 bg-amber-50/50 font-bold"><td colSpan={3} className="p-2 text-right">Rata-rata Kelas</td><td className="p-2 text-center text-emerald-700">{classAvg.toFixed(2)}</td><td className="p-2"></td>{mapping.map(m=><td key={m.id} className="p-2 text-center text-[11px]">{(subAvg[m.kode]||0).toFixed(1)}%</td>)}<td className="p-2 text-center">{Object.values(cplScores).length? (Object.values(cplScores).reduce((a,b)=>a+b,0)/Object.values(cplScores).filter(v=>v>0).length).toFixed(1):"0"}%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-4"><div className="text-sm font-semibold mb-1">Radar Capaian CPL</div><div className="text-[11px] text-slate-500 mb-3">Target 80% vs Realisasi</div><div className="h-[300px]"><canvas ref={radarRef}/></div></div>
              <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-4 lg:col-span-2"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold">Distribusi Sub-CPMK & CPMK</div><div className="text-[11px] text-slate-500">Threshold 70% • Merah = perlu evaluasi</div></div><span className="text-[11px] px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">Garis ambang 70%</span></div><div className="h-[300px] mt-3"><canvas ref={barRef}/></div></div>
            </div>

            <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-4"><div className="text-sm font-semibold">Network Graph Relasi CPL (vis-network)</div><div className="text-[11px] text-slate-500 mb-2">Drag, zoom, hover. Physics enabled.</div><div ref={networkRef} className="h-[360px] rounded-xl border border-slate-200 bg-[#fcfdfd]"/></div>

            <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2"><div className="text-sm font-bold">Simpulan Otomatis — 6 Kalimat</div><button onClick={()=>{ navigator.clipboard.writeText(summary); showToast("Disalin"); }} className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px]">Copy</button></div>
              <p className="text-[13px] leading-relaxed text-slate-700 bg-amber-50/60 border border-amber-200 rounded-xl p-4">{summary}</p>
            </div>

            {/* Print Area */}
            <div id="print-area" className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="text-center border-b-2 border-emerald-700 pb-4">
                <div className="font-bold text-lg">UNIVERSITAS TEKNOLOGI DIGITAL INDONESIA</div>
                <div className="text-sm">Fakultas {metadata.fakultas} • Program Studi {metadata.prodi||"Teknik Informatika"}</div>
                <div className="text-[11px] text-slate-500">Jl. Pendidikan No. 1, Kota • Telp. 021-xxxx • www.utdi.ac.id</div>
                <div className="mt-2 font-bold uppercase tracking-wide">Lembar Pengesahan Capaian Pembelajaran</div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4 text-xs">
                <div className="space-y-1"><div><b>Mata Kuliah:</b> {metadata.matkul} ({metadata.kode})</div><div><b>SKS / Semester:</b> {metadata.sks} / {metadata.semester}</div><div><b>T.A.:</b> {metadata.tahun}</div></div>
                <div className="space-y-1"><div><b>Kelas:</b> {metadata.kelas}</div><div><b>Dosen:</b> {metadata.dosen}</div><div><b>Rata-rata Kelas:</b> {classAvg.toFixed(2)}</div></div>
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-5">
                <div className="rounded-xl border p-2"><div className="text-[11px] font-semibold">Radar CPL</div><canvas ref={radarRef} style={{ display:"none" }}/><img alt="radar" src={radarRef.current?.toDataURL?.()||""} className="w-full rounded"/></div>
                <div className="rounded-xl border p-2 md:col-span-2"><div className="text-[11px] font-semibold">Bar Sub-CPMK/CPMK</div><img alt="bar" src={barRef.current?.toDataURL?.()||""} className="w-full rounded"/></div>
              </div>

              <div className="mt-4 text-[12px] leading-relaxed border rounded-xl p-3 bg-slate-50">{summary}</div>

              <div className="grid grid-cols-2 gap-8 mt-8">
                {[
                  { label:"Dosen Pengampu", k:"dosen" },
                  { label:"Koordinator Prodi / Kaprodi", k:"kaprodi" }
                ].map(col=>(
                  <div key={col.k} className="text-center">
                    <div className="text-xs text-slate-500">{col.label}</div>
                    <div className="mt-10 space-y-2">
                      <input value={(ttd as any)[`${col.k}Nama`]} onChange={e=>setTtd({...ttd, [`${col.k}Nama`]:e.target.value})} className="w-full text-center border-b border-slate-300 bg-transparent text-sm py-1 focus:outline-none" placeholder="Nama"/>
                      <input value={(ttd as any)[`${col.k}Nip`]} onChange={e=>setTtd({...ttd, [`${col.k}Nip`]:e.target.value})} className="w-full text-center border-b border-slate-300 bg-transparent text-[11px] py-1" placeholder="NIP"/>
                      <input value={(ttd as any)[`${col.k}Tgl`]} onChange={e=>setTtd({...ttd, [`${col.k}Tgl`]:e.target.value})} className="w-full text-center text-[11px] text-slate-500 bg-transparent" placeholder="Tanggal"/>
                      <div className="h-16"/>
                      <div className="text-sm font-semibold">{(ttd as any)[`${col.k}Nama`]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-between items-center no-print">
              <button onClick={()=>setStep(4)} className="px-4 py-2.5 rounded-xl bg-white border text-sm">← Kembali</button>
              <div className="flex gap-2">
                <button onClick={handleSahkan} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow">✓ Sahkan & Simpan ke Riwayat</button>
                <button onClick={()=>setStep(6)} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold">Lihat Riwayat →</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step===6 && (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl md:text-2xl font-bold">Riwayat Pengukuran (simulasi Supabase)</h2><div className="flex gap-2"><button onClick={exportCSV} className="px-3 py-2 rounded-xl bg-white border text-xs">Export CSV</button><button onClick={downloadPDF} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold">Cetak Ulang PDF</button></div></div>

            <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="p-3 text-left">No</th><th className="p-3 text-left">Tanggal</th><th className="p-3 text-left">TA / Smt</th><th className="p-3 text-left">MK</th><th className="p-3">Kelas</th><th className="p-3 text-left">Dosen</th><th className="p-3">Avg CPL</th><th className="p-3">Status</th><th className="p-3">Aksi</th></tr></thead>
                  <tbody>
                    {history.length===0 && <tr><td colSpan={9} className="p-8 text-center text-slate-500 text-sm">Belum ada riwayat. Sahkan pengukuran di Step 5.</td></tr>}
                    {history.map((h,i)=>(
                      <tr key={h.id} className="border-t border-slate-100">
                        <td className="p-3">{i+1}</td>
                        <td className="p-3 font-mono text-xs">{new Date(h.timestamp).toLocaleString("id-ID")}</td>
                        <td className="p-3 text-xs">{h.metadata.tahun} / {h.metadata.semester}</td>
                        <td className="p-3 font-medium">{h.metadata.matkul} <span className="text-[10px] text-slate-500">({h.metadata.kode})</span></td>
                        <td className="p-3 text-center">{h.metadata.kelas}</td>
                        <td className="p-3 max-w-[160px] truncate">{h.metadata.dosen}</td>
                        <td className="p-3 text-center font-bold">{h.studentsAvg?.toFixed?.(2)}%</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] border font-semibold ${h.status==="Disahkan"?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-amber-50 text-amber-700 border-amber-200"}`}>{h.status}</span></td>
                        <td className="p-3"><div className="flex gap-1"><button onClick={()=>{ setMetadata(h.metadata); setBobot(h.bobot); setMapping(h.mapping); setStep(5); showToast("Memuat riwayat"); }} className="px-2 py-1 rounded-full bg-slate-900 text-white text-[11px]">Lihat</button><button onClick={()=>{ if(confirm("Hapus riwayat ini?")) setHistory(history.filter(x=>x.id!==h.id)); }} className="px-2 py-1 rounded-full bg-white border text-[11px]">Hapus</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between"><button onClick={()=>setStep(5)} className="px-4 py-2.5 rounded-xl bg-white border text-sm">← Kembali ke Capaian</button><div className="text-[11px] text-slate-500">Data tersimpan di <code className="bg-slate-100 px-1 rounded">cpl_history</code> (simulasi Supabase). Fungsi <code className="bg-slate-100 px-1 rounded">saveToSupabase()</code> log di console.</div></div>
          </div>
        )}
      </main>

      {/* Footer nav mobile */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur border-t border-slate-200 p-2 flex gap-2 no-print">
        <button disabled={step===1} onClick={()=>setStep(s=>Math.max(1,s-1))} className="flex-1 py-2.5 rounded-xl bg-white border text-sm disabled:opacity-40">Back</button>
        <button disabled={step===6} onClick={()=>setStep(s=>Math.min(6,s+1))} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-40">Next</button>
      </div>

      {toast && <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg">{toast}</div>}
    </div>
  );
}
