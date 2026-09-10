export type Lang = "en" | "tr";
export type Mode =
  | "explore"
  | "structure"
  | "joints"
  | "actuation"
  | "sensors"
  | "power"
  | "compute"
  | "perception"
  | "control"
  | "behavior";
export type Bi = [string, string];
export const t = (value: Bi, lang: Lang) => value[lang === "en" ? 0 : 1];
export const modes: {
  id: Mode;
  name: Bi;
  title: Bi;
  subtitle: Bi;
  categories: string[];
}[] = [
  {
    id: "explore",
    name: ["Explore", "Keşfet"],
    title: ["A body. A connected system.", "Bir beden. Bağlı bir sistem."],
    subtitle: [
      "Explore the engineering behind embodied intelligence.",
      "Bedensel zekânın ardındaki mühendisliği keşfet.",
    ],
    categories: [],
  },
  {
    id: "structure",
    name: ["Structure", "Yapı"],
    title: ["Built to carry the load.", "Yükü taşımak için."],
    subtitle: [
      "Follow the frame from the torso to the ground.",
      "Gövdeden zemine taşıyıcı yapıyı takip et.",
    ],
    categories: ["structure"],
  },
  {
    id: "joints",
    name: ["Joints", "Eklemler"],
    title: ["Rigid links. Fluid motion.", "Rijit bağlar. Akıcı hareket."],
    subtitle: [
      "Separate a joint. Discover where movement begins.",
      "Bir eklemi ayır. Hareketin nerede başladığını keşfet.",
    ],
    categories: [
      "actuators",
      "transmissions",
      "bearings",
      "sensors",
      "structure",
    ],
  },
  {
    id: "actuation",
    name: ["Actuation", "Tahrik"],
    title: ["Electricity becomes motion.", "Elektrik harekete dönüşür."],
    subtitle: [
      "Every actuator is part of a mechanical chain.",
      "Her eyleyici, mekanik bir zincirin parçasıdır.",
    ],
    categories: ["actuators", "transmissions"],
  },
  {
    id: "sensors",
    name: ["Sensors", "Sensörler"],
    title: ["A body that can measure.", "Ölçebilen bir beden."],
    subtitle: [
      "Discover how a robot observes itself and its surroundings.",
      "Robotun kendisini ve çevresini nasıl gözlediğini keşfet.",
    ],
    categories: ["sensors"],
  },
  {
    id: "power",
    name: ["Power", "Güç"],
    title: ["Every movement needs energy.", "Her hareket enerji ister."],
    subtitle: [
      "Trace the path from the battery to the body.",
      "Bataryadan bedene enerji yolunu takip et.",
    ],
    categories: ["power", "actuators"],
  },
  {
    id: "compute",
    name: ["Compute", "Hesaplama"],
    title: ["One body. Many timescales.", "Bir beden. Farklı zaman ölçekleri."],
    subtitle: [
      "From task reasoning to the motor’s current loop.",
      "Görev akıl yürütmesinden motorun akım döngüsüne.",
    ],
    categories: ["compute", "data_harness"],
  },
  {
    id: "perception",
    name: ["Perception", "Algı"],
    title: ["From light to world state.", "Işıktan dünya durumuna."],
    subtitle: [
      "Perception builds an estimate, with uncertainty.",
      "Algı, belirsizlik içeren bir tahmin oluşturur.",
    ],
    categories: ["sensors", "compute"],
  },
  {
    id: "control",
    name: ["Control", "Kontrol"],
    title: ["Motion is a conversation.", "Hareket bir etkileşimdir."],
    subtitle: [
      "Sense. Estimate. Plan. Act. Measure again.",
      "Algıla. Kestir. Planla. Harekete geç. Yeniden ölç.",
    ],
    categories: ["sensors", "actuators", "compute", "data_harness"],
  },
  {
    id: "behavior",
    name: ["Behavior", "Davranış"],
    title: ["The whole system moves.", "Bütün sistem hareket eder."],
    subtitle: [
      "Connect sensing and control to an embodied action.",
      "Ölçüm ve kontrolü bedensel bir eylemle ilişkilendir.",
    ],
    categories: [],
  },
];
export interface Lesson {
  title: Bi;
  summary: Bi;
  why: Bi;
  chain: Bi[];
  receives: Bi;
  produces: Bi;
  observes: Bi;
  influences: Bi;
  note?: Bi;
  source?: number;
}
export const lessons: Record<string, Lesson> = {
  explore: {
    title: ["More than a machine.", "Bir makineden fazlası."],
    summary: [
      "Structure, sensing and computation work together. Follow a component to see how the whole system moves.",
      "Yapı, ölçüm ve hesaplama birlikte çalışır. Bütün sistemin nasıl hareket ettiğini görmek için bir bileşeni takip et.",
    ],
    why: [
      "A humanoid is a coupled physical system. Intelligence becomes behavior through mechanics, energy, contact and continuous feedback.",
      "Humanoid, fiziksel olarak bağlı bir sistemdir. Zekâ; mekanik, enerji, temas ve sürekli geri besleme yoluyla davranışa dönüşür.",
    ],
    chain: [
      ["Sense", "Algıla"],
      ["Estimate", "Kestir"],
      ["Control", "Kontrol et"],
      ["Actuate", "Hareket üret"],
      ["Sense again", "Yeniden algıla"],
    ],
    receives: ["A task and observations", "Görev ve gözlemler"],
    produces: ["Embodied behavior", "Bedensel davranış"],
    observes: ["Body and environment", "Beden ve çevre"],
    influences: ["Every connected subsystem", "Bağlı tüm alt sistemler"],
  },
  structure: {
    title: ["The hidden load path.", "Görünmeyen yük yolu."],
    summary: [
      "Covers protect. The frame supports. Forces travel through links, joint bearings, the pelvis and the feet.",
      "Kapaklar korur. İskelet taşır. Kuvvetler bağlar, eklem rulmanları, pelvis ve ayaklar üzerinden aktarılır.",
    ],
    why: [
      "Open aluminum-family links balance stiffness and mass. Steel-family shafts and bearing interfaces transfer loads. Polymer covers and elastomer soles serve different purposes.",
      "Açık alüminyum esaslı bağlar rijitlik ve kütleyi dengeler. Çelik esaslı miller ve rulman arayüzleri yükleri aktarır. Polimer kapakların ve elastomer tabanların görevleri farklıdır.",
    ],
    chain: [
      ["Torso frame", "Gövde iskeleti"],
      ["Pelvis", "Pelvis"],
      ["Leg links", "Bacak bağları"],
      ["Bearings", "Rulmanlar"],
      ["Ground contact", "Zemin teması"],
    ],
    receives: ["Gravity and contact forces", "Yerçekimi ve temas kuvvetleri"],
    produces: ["A connected load path", "Bağlı bir yük yolu"],
    observes: ["Force sensing at interfaces", "Arayüzlerde kuvvet ölçümü"],
    influences: [
      "Stiffness, mass and alignment",
      "Rijitlik, kütle ve hizalama",
    ],
    note: [
      "Material families are illustrative. No alloy, load rating or structural analysis is claimed.",
      "Malzeme aileleri örnektir. Alaşım, yük kapasitesi veya yapısal analiz iddiası yoktur.",
    ],
  },
  knee: {
    title: ["Inside the knee.", "Dizin içinde."],
    summary: [
      "One rotational axis links the thigh to the shin. A motor and a reduction stage work together to move the lower leg.",
      "Tek bir dönme ekseni uyluğu kaval kemiği bölgesine bağlar. Motor ve redüktör birlikte alt bacağı hareket ettirir.",
    ],
    why: [
      "The motor drives the sun gear. Planets mesh with a fixed ring and move an output carrier. The bearing supports joint loads; the output encoder reports joint position.",
      "Motor güneş dişlisini sürer. Gezegen dişliler sabit halkayla kavraşır ve çıkış taşıyıcısını hareket ettirir. Rulman eklem yüklerini taşır; çıkış enkoderi eklem konumunu bildirir.",
    ],
    chain: [
      ["Motor", "Motor"],
      ["Reduction", "Redüktör"],
      ["Output carrier", "Çıkış taşıyıcısı"],
      ["Knee motion", "Diz hareketi"],
      ["Encoder feedback", "Enkoder geri beslemesi"],
    ],
    receives: ["Joint target → current command", "Eklem hedefi → akım komutu"],
    produces: ["Torque at the output link", "Çıkış bağında tork"],
    observes: [
      "Position; current and temperature conceptually",
      "Konum; kavramsal olarak akım ve sıcaklık",
    ],
    influences: [
      "Leg configuration and body support",
      "Bacak duruşu ve beden desteği",
    ],
    note: [
      "Schematic planetary geometry. Motion is kinematic; no torque rating, ratio or dynamic simulation is implied.",
      "Şematik planet dişli geometrisi. Hareket kinematiktir; tork, oran veya dinamik simülasyon iddiası yoktur.",
    ],
    source: 1,
  },
  hip: {
    title: ["Three axes. One hip.", "Üç eksen. Bir kalça."],
    summary: [
      "Serial yaw, roll and pitch joints connect the pelvis to the thigh. A mechanical hip need not copy a biological ball joint.",
      "Seri sapma, yuvarlanma ve yunuslama eklemleri pelvisi uyluğa bağlar. Mekanik kalçanın biyolojik küresel eklemi kopyalaması gerekmez.",
    ],
    why: [
      "Separate cartridges permit rotation, abduction/adduction and flexion/extension. Their offset axes require coordinated motion and a stiff supporting frame.",
      "Ayrı modüller dönme, açılma/kapanma ve bükülme/uzamaya olanak verir. Ötelenmiş eksenler eşgüdümlü hareket ve rijit bir taşıyıcı gerektirir.",
    ],
    chain: [
      ["Pelvis", "Pelvis"],
      ["Yaw", "Sapma"],
      ["Roll", "Yuvarlanma"],
      ["Pitch", "Yunuslama"],
      ["Thigh", "Uyluk"],
    ],
    receives: ["Coordinated joint targets", "Eşgüdümlü eklem hedefleri"],
    produces: ["Thigh orientation", "Uyluk yönelimi"],
    observes: ["An encoder at each axis", "Her eksende enkoder"],
    influences: [
      "Posture, reachability and balance",
      "Duruş, erişilebilirlik ve denge",
    ],
  },
  shoulder: {
    title: ["Reach begins here.", "Uzanma burada başlar."],
    summary: [
      "Three shoulder axes place the upper arm in space. The elbow and wrist complete the chain to the hand.",
      "Üç omuz ekseni üst kolu uzayda konumlandırır. Dirsek ve bilek, ele uzanan zinciri tamamlar.",
    ],
    why: [
      "Rotations compound along a serial chain. Multiple shoulder configurations can serve a hand target, but joint limits and collisions restrict what is possible.",
      "Seri zincirde dönmeler birikir. Farklı omuz konfigürasyonları aynı el hedefine hizmet edebilir; ancak eklem sınırları ve çarpışmalar olasılıkları kısıtlar.",
    ],
    chain: [
      ["Target pose", "Hedef poz"],
      ["Shoulder axes", "Omuz eksenleri"],
      ["Elbow", "Dirsek"],
      ["Wrist", "Bilek"],
      ["Hand", "El"],
    ],
    receives: ["Arm configuration targets", "Kol konfigürasyonu hedefleri"],
    produces: ["Upper-arm orientation", "Üst kol yönelimi"],
    observes: ["Joint positions", "Eklem konumları"],
    influences: ["Reach and manipulation", "Uzanma ve manipülasyon"],
  },
  elbow: {
    title: ["The simplest motion chain.", "En sade hareket zinciri."],
    summary: [
      "A single hinge turns the forearm. This is the clearest place to connect a motor command with measured joint motion.",
      "Tek bir menteşe ön kolu döndürür. Motor komutunu ölçülen eklem hareketiyle ilişkilendirmek için en sade örnektir.",
    ],
    why: [
      "Reduction trades speed for torque, with losses. An output encoder measures the joint after the transmission, helping the controller compare target and measured angle.",
      "Redüktör, kayıplarla birlikte hızdan tork kazanır. Çıkış enkoderi eklemi redüktörden sonra ölçer; kontrolcünün hedef ve ölçülen açıyı karşılaştırmasına yardımcı olur.",
    ],
    chain: [
      ["Angle target", "Açı hedefi"],
      ["Motor drive", "Motor sürücüsü"],
      ["Reduction", "Redüktör"],
      ["Forearm", "Ön kol"],
      ["Encoder", "Enkoder"],
    ],
    receives: ["Desired angle", "İstenen açı"],
    produces: ["Forearm rotation", "Ön kol dönmesi"],
    observes: ["Output position", "Çıkış konumu"],
    influences: ["Hand reach", "El erişimi"],
    source: 1,
  },
  ankle: {
    title: ["A small joint. A big role.", "Küçük eklem. Büyük görev."],
    summary: [
      "Pitch and roll actuation changes how the foot and lower leg interact. Foot loads and inertial measurements help estimate balance.",
      "Yunuslama ve yuvarlanma tahriki, ayak ve alt bacak etkileşimini değiştirir. Ayak yükleri ve atalet ölçümleri denge kestirimine yardımcı olur.",
    ],
    why: [
      "Ankle correction is one balance strategy. The hips, steps and contact changes may also be needed. Ground friction and available torque constrain every response.",
      "Ayak bileği düzeltmesi bir denge stratejisidir. Kalça, adım veya temas değişimi de gerekebilir. Zemin sürtünmesi ve mevcut tork her yanıtı sınırlar.",
    ],
    chain: [
      ["Foot load + IMU", "Ayak yükü + IMU"],
      ["State estimate", "Durum kestirimi"],
      ["Balance control", "Denge kontrolü"],
      ["Ankle correction", "Bilek düzeltmesi"],
      ["New contact forces", "Yeni temas kuvvetleri"],
    ],
    receives: ["Posture correction targets", "Duruş düzeltme hedefleri"],
    produces: ["Foot–leg relative rotation", "Ayak–bacak bağıl dönmesi"],
    observes: ["Force/torque and encoders", "Kuvvet/tork ve enkoderler"],
    influences: ["Contact and balance", "Temas ve denge"],
    source: 0,
  },
  actuation: {
    title: ["Where torque comes from.", "Torkun kaynağı."],
    summary: [
      "Electric motors convert electrical energy into mechanical torque. A reduction stage adapts their motion to the joint.",
      "Elektrik motorları elektrik enerjisini mekanik torka çevirir. Redüktör, motor hareketini ekleme uyarlar.",
    ],
    why: [
      "Lower-body modules often face larger support loads. Selection depends on torque, speed, heat, duty cycle and packaging—not size alone.",
      "Alt beden modülleri çoğu zaman daha büyük destek yükleriyle karşılaşır. Seçim yalnızca boyuta değil; tork, hız, ısı, çalışma çevrimi ve yerleşime bağlıdır.",
    ],
    chain: [
      ["Electrical current", "Elektrik akımı"],
      ["Motor torque", "Motor torku"],
      ["Transmission", "Aktarma"],
      ["Joint torque", "Eklem torku"],
      ["Physical motion", "Fiziksel hareket"],
    ],
    receives: [
      "Drive current and electrical power",
      "Sürücü akımı ve elektrik gücü",
    ],
    produces: ["Torque, motion and heat", "Tork, hareket ve ısı"],
    observes: ["Position, current and temperature", "Konum, akım ve sıcaklık"],
    influences: ["Support, reach and efficiency", "Destek, erişim ve verim"],
    source: 1,
  },
  transmission: {
    title: ["Speed becomes torque.", "Hız torka dönüşür."],
    summary: [
      "A planetary stage packages the sun, planets, ring and carrier around a common axis. HEX uses this one representative strategy consistently.",
      "Planet kademesi; güneş, gezegen, halka ve taşıyıcıyı ortak eksen çevresine yerleştirir. HEX bu temsili stratejiyi tutarlı biçimde kullanır.",
    ],
    why: [
      "With the ring fixed, motor-driven sun rotation produces slower carrier output. Reduced speed allows greater output torque, subject to efficiency, stiffness and thermal limits.",
      "Halka sabitken motorun sürdüğü güneş dönüşü daha yavaş taşıyıcı çıkışı üretir. Azalan hız; verim, rijitlik ve termal sınırlar dahilinde daha yüksek çıkış torkuna izin verir.",
    ],
    chain: [
      ["Motor shaft", "Motor mili"],
      ["Sun gear", "Güneş dişlisi"],
      ["Planets + fixed ring", "Gezegenler + sabit halka"],
      ["Carrier output", "Taşıyıcı çıkışı"],
    ],
    receives: ["Motor rotation", "Motor dönüşü"],
    produces: ["Reduced output speed", "Azaltılmış çıkış hızı"],
    observes: [
      "Output position through encoder",
      "Enkoder üzerinden çıkış konumu",
    ],
    influences: ["Torque, backlash and stiffness", "Tork, boşluk ve rijitlik"],
    note: [
      "Tooth profiles are schematic. This model does not demonstrate contact mechanics or a verified reduction ratio.",
      "Diş profilleri şematiktir. Model, temas mekaniği veya doğrulanmış redüksiyon oranı göstermez.",
    ],
    source: 1,
  },
  sensors: {
    title: ["Measure body and world.", "Bedeni ve dünyayı ölç."],
    summary: [
      "Cameras look outward. Encoders, an IMU and foot sensors describe the body and its contact with the ground.",
      "Kameralar dışarı bakar. Enkoderler, IMU ve ayak sensörleri bedeni ve zeminle temasını tanımlar.",
    ],
    why: [
      "No single sensor sees the whole state. Different measurements are fused, while noise, bias, delay and missing data remain part of the problem.",
      "Tek bir sensör tüm durumu göremez. Ölçümler birleştirilir; gürültü, yanlılık, gecikme ve eksik veri problemin parçası olmaya devam eder.",
    ],
    chain: [
      ["Physical quantity", "Fiziksel büyüklük"],
      ["Sensor signal", "Sensör sinyali"],
      ["Calibration / fusion", "Kalibrasyon / füzyon"],
      ["State estimate", "Durum kestirimi"],
    ],
    receives: [
      "Light, motion and contact loads",
      "Işık, hareket ve temas yükleri",
    ],
    produces: ["Measurements with uncertainty", "Belirsizlik içeren ölçümler"],
    observes: ["Body and environment", "Beden ve çevre"],
    influences: [
      "State estimation and feedback",
      "Durum kestirimi ve geri besleme",
    ],
    source: 2,
  },
  encoder: {
    title: ["Knowing a joint’s angle.", "Eklem açısını bilmek."],
    summary: [
      "The output encoder measures rotation after the reduction stage. Its signal lets control compare measured position with a target.",
      "Çıkış enkoderi redüktörden sonraki dönüşü ölçer. Sinyali, ölçülen konumu hedefle karşılaştırmayı sağlar.",
    ],
    why: [
      "Position does not directly measure torque. Motor current may help estimate motor torque, but transmission losses and contact loads complicate inference.",
      "Konum doğrudan tork ölçmez. Motor akımı, motor torkunu kestirmeye yardımcı olabilir; aktarma kayıpları ve temas yükleri çıkarımı karmaşıklaştırır.",
    ],
    chain: [
      ["Joint rotation", "Eklem dönüşü"],
      ["Encoder signal", "Enkoder sinyali"],
      ["Position estimate", "Konum kestirimi"],
      ["Control error", "Kontrol hatası"],
    ],
    receives: ["Relative shaft rotation", "Bağıl mil dönüşü"],
    produces: ["Position measurement", "Konum ölçümü"],
    observes: ["Joint output", "Eklem çıkışı"],
    influences: ["Tracking and coordination", "İzleme ve eşgüdüm"],
  },
  imu: {
    title: ["Feeling the body move.", "Bedenin hareketini ölçmek."],
    summary: [
      "The torso IMU combines gyroscopes and accelerometers. It measures angular velocity and specific force.",
      "Gövde IMU’su jiroskop ve ivmeölçerleri birleştirir. Açısal hız ve özgül kuvvet ölçer.",
    ],
    why: [
      "Orientation is estimated by combining measurements and a model. Accelerometer readings include the effect of gravity; bias and drift must be managed.",
      "Yönelim, ölçümler ve model birleştirilerek kestirilir. İvmeölçer okumaları yerçekiminin etkisini içerir; yanlılık ve sürüklenme yönetilmelidir.",
    ],
    chain: [
      ["Body tilt / motion", "Gövde eğimi / hareketi"],
      ["Gyro + accelerometer", "Jiroskop + ivmeölçer"],
      ["Sensor fusion", "Sensör füzyonu"],
      ["State estimate", "Durum kestirimi"],
      ["Correction", "Düzeltme"],
    ],
    receives: [
      "Angular motion and specific force",
      "Açısal hareket ve özgül kuvvet",
    ],
    produces: ["Inertial measurements", "Atalet ölçümleri"],
    observes: ["Torso motion", "Gövde hareketi"],
    influences: [
      "Orientation estimation and balance",
      "Yönelim kestirimi ve denge",
    ],
    source: 2,
  },
  foot: {
    title: ["Where the world pushes back.", "Dünyanın karşılık verdiği yer."],
    summary: [
      "Four representative load regions show heel, toe and side contact. An ankle force/torque interface adds another view of the contact wrench.",
      "Dört temsili yük bölgesi topuk, burun ve yan temasları gösterir. Bilekteki kuvvet/tork arayüzü temas kuvvet ve momentine başka bir bakış sunar.",
    ],
    why: [
      "Center of pressure summarizes the location of the resultant normal contact load. It is different from center of mass. Both depend on the chosen model and actual contact.",
      "Basınç merkezi, bileşke normal temas yükünün konumunu özetler. Kütle merkezinden farklıdır. İkisi de seçilen modele ve gerçek temasa bağlıdır.",
    ],
    chain: [
      ["Ground contact", "Zemin teması"],
      ["Regional loads", "Bölgesel yükler"],
      ["Center of pressure", "Basınç merkezi"],
      ["Balance estimate", "Denge kestirimi"],
    ],
    receives: ["Contact forces and moments", "Temas kuvvetleri ve momentleri"],
    produces: ["Load measurements", "Yük ölçümleri"],
    observes: ["Ground interaction", "Zemin etkileşimi"],
    influences: ["Stance and contact decisions", "Duruş ve temas kararları"],
    source: 0,
  },
  power: {
    title: ["Two branches. One source.", "İki kol. Tek kaynak."],
    summary: [
      "The battery supplies motor drives and a separate conversion branch for compute and sensing. A BMS supervises the pack.",
      "Batarya, motor sürücülerini ve hesaplama/algılama için ayrı dönüşüm kolunu besler. BMS paketi gözetir.",
    ],
    why: [
      "Power distribution, protection, wiring and heat are part of the architecture. Orange harness routes show representative energy paths, not a detailed electrical schematic.",
      "Güç dağıtımı, koruma, kablolama ve ısı mimarinin parçasıdır. Turuncu demetler ayrıntılı elektrik şeması değil, temsili enerji yollarıdır.",
    ],
    chain: [
      ["Battery + BMS", "Batarya + BMS"],
      ["Distribution", "Dağıtım"],
      ["Motor drive / DC conversion", "Motor sürücüsü / DC dönüşümü"],
      ["Actuators / compute", "Eyleyiciler / hesaplama"],
    ],
    receives: ["Stored electrical energy", "Depolanmış elektrik enerjisi"],
    produces: ["Distributed power", "Dağıtılmış güç"],
    observes: [
      "Pack state and protection signals",
      "Paket durumu ve koruma sinyalleri",
    ],
    influences: [
      "Runtime, heat and available motion",
      "Çalışma süresi, ısı ve hareket kapasitesi",
    ],
    note: [
      "No voltage, capacity, power rating or wiring specification is assigned.",
      "Gerilim, kapasite, güç değeri veya kablolama özelliği atanmamıştır.",
    ],
  },
  compute: {
    title: ["Thinking at different speeds.", "Farklı hızlarda düşünmek."],
    summary: [
      "Main compute supports perception and planning. A realtime controller coordinates the body. Local motor drives close the actuator loops.",
      "Ana hesaplama algı ve planlamayı destekler. Gerçek zamanlı kontrolcü bedeni koordine eder. Yerel motor sürücüleri eyleyici döngülerini kapatır.",
    ],
    why: [
      "Semantic decisions and current control have different timing needs. An internal data network exchanges measurements and commands between these layers.",
      "Anlamsal kararlar ve akım kontrolünün zamanlama gereksinimleri farklıdır. İç veri ağı, bu katmanlar arasında ölçüm ve komutları taşır.",
    ],
    chain: [
      ["Task / planning", "Görev / planlama"],
      ["Whole-body control", "Tüm beden kontrolü"],
      ["Joint control", "Eklem kontrolü"],
      ["Motor current control", "Motor akım kontrolü"],
    ],
    receives: [
      "Sensor data and task goals",
      "Sensör verisi ve görev hedefleri",
    ],
    produces: [
      "Estimates, plans and commands",
      "Kestirimler, planlar ve komutlar",
    ],
    observes: ["Feedback from the body", "Bedenden geri besleme"],
    influences: [
      "Coordination and response timing",
      "Eşgüdüm ve yanıt zamanlaması",
    ],
    note: [
      "CAN, EtherCAT and Ethernet are possible protocol examples, not specifications for HEX. No fixed control frequencies are assigned.",
      "CAN, EtherCAT ve Ethernet olası protokol örnekleridir; HEX özelliği değildir. Sabit kontrol frekansları atanmamıştır.",
    ],
  },
  perception: {
    title: ["An estimate of the outside.", "Dış dünyanın bir kestirimi."],
    summary: [
      "Camera measurements become features, candidate objects and an estimated world state. The result is useful, but incomplete.",
      "Kamera ölçümleri özelliklere, olası nesnelere ve kestirilen dünya durumuna dönüşür. Sonuç yararlıdır, fakat eksiktir.",
    ],
    why: [
      "The frustum shows a conceptual field of view. The target, floor and obstacle are a teaching scene. Labels are scripted examples; no vision model runs here.",
      "Görüş piramidi kavramsal görüş alanını gösterir. Hedef, zemin ve engel bir eğitim sahnesidir. Etiketler önceden tanımlıdır; burada görme modeli çalışmaz.",
    ],
    chain: [
      ["Raw camera", "Ham kamera"],
      ["Objects / features", "Nesneler / özellikler"],
      ["World representation", "Dünya temsili"],
      ["Task state", "Görev durumu"],
    ],
    receives: ["Images and inertial context", "Görüntüler ve atalet bağlamı"],
    produces: ["A world-state estimate", "Dünya durumu kestirimi"],
    observes: ["Visible environment", "Görülebilir çevre"],
    influences: ["Target selection and planning", "Hedef seçimi ve planlama"],
    note: [
      "Visibility is not certainty. Occlusion, calibration and ambiguous features affect real perception.",
      "Görünürlük kesinlik değildir. Örtülme, kalibrasyon ve belirsiz özellikler gerçek algıyı etkiler.",
    ],
  },
  control: {
    title: ["Close the loop.", "Döngüyü kapat."],
    summary: [
      "Desired motion becomes joint targets and motor commands. Measured motion comes back, and the controller updates its response.",
      "İstenen hareket eklem hedeflerine ve motor komutlarına dönüşür. Ölçülen hareket geri gelir; kontrolcü yanıtını günceller.",
    ],
    why: [
      "Feedforward predictions and feedback can work together. Delays, uncertainty, actuator limits and contact make physical control different from issuing a one-way command.",
      "İleri besleme tahminleri ve geri besleme birlikte çalışabilir. Gecikme, belirsizlik, eyleyici sınırları ve temas; fiziksel kontrolü tek yönlü komut vermekten ayırır.",
    ],
    chain: [
      ["Sense", "Algıla"],
      ["Estimate", "Kestir"],
      ["Plan", "Planla"],
      ["Control", "Kontrol et"],
      ["Actuate → world → sense", "Eyle → dünya → algıla"],
    ],
    receives: [
      "Task goals and state estimates",
      "Görev hedefleri ve durum kestirimleri",
    ],
    produces: ["Actuator commands", "Eyleyici komutları"],
    observes: ["The result of its own action", "Kendi eyleminin sonucu"],
    influences: [
      "Tracking, stability and behavior",
      "İzleme, kararlılık ve davranış",
    ],
    source: 0,
  },
  balance: {
    title: ["Lean. Sense. Recover.", "Eğil. Ölç. Toparlan."],
    summary: [
      "A small lean changes inertial and contact signals. The teaching sequence connects those signals to an ankle/hip correction.",
      "Küçük bir eğim atalet ve temas sinyallerini değiştirir. Eğitim dizisi bu sinyalleri bilek/kalça düzeltmesine bağlar.",
    ],
    why: [
      "The support polygon is the convex region spanned by the current contacts. Keeping projected mass inside it is only a static intuition; momentum, friction and control authority also matter.",
      "Destek çokgeni, mevcut temasların oluşturduğu dışbükey bölgedir. İzdüşen kütleyi içeride tutmak yalnızca statik sezgidir; momentum, sürtünme ve kontrol kapasitesi de önemlidir.",
    ],
    chain: [
      ["Small disturbance", "Küçük bozucu etki"],
      ["IMU + foot loads", "IMU + ayak yükleri"],
      ["State estimate", "Durum kestirimi"],
      ["Ankle / hip correction", "Bilek / kalça düzeltmesi"],
      ["Measure again", "Yeniden ölç"],
    ],
    receives: ["Changing posture and contact", "Değişen duruş ve temas"],
    produces: ["A corrective motion", "Düzeltici hareket"],
    observes: [
      "IMU, encoders and foot sensing",
      "IMU, enkoder ve ayak ölçümleri",
    ],
    influences: ["Grounded stability", "Zeminde kararlılık"],
    note: [
      "Scripted kinematics, not a balance simulation. COM and CoP markers are illustrative and are not calculated from mass or force data.",
      "Önceden tanımlı kinematik hareket; denge simülasyonu değildir. Kütle ve basınç merkezi işaretleri temsildir; kütle/kuvvet verisinden hesaplanmaz.",
    ],
    source: 0,
  },
  reach: {
    title: ["An intention becomes motion.", "Niyet harekete dönüşür."],
    summary: [
      "Select the target, follow the desired hand pose, and watch the shoulder and elbow cooperate in a reaching sequence.",
      "Hedefi seç, istenen el pozunu takip et ve uzanma dizisinde omuz ile dirseğin iş birliğini izle.",
    ],
    why: [
      "Real reaching needs calibrated perception, a kinematic model, collision checks and feedback. Here, a pre-authored motion makes the causal chain visible.",
      "Gerçek uzanma kalibre algı, kinematik model, çarpışma kontrolü ve geri besleme gerektirir. Burada hazırlanmış hareket, nedensel zinciri görünür kılar.",
    ],
    chain: [
      ["Perceived target", "Algılanan hedef"],
      ["Desired hand pose", "İstenen el pozu"],
      ["Joint configuration", "Eklem konfigürasyonu"],
      ["Actuator commands", "Eyleyici komutları"],
      ["Visual feedback", "Görsel geri besleme"],
    ],
    receives: ["A target location", "Hedef konumu"],
    produces: ["An arm motion", "Kol hareketi"],
    observes: ["Hand and target position", "El ve hedef konumu"],
    influences: ["Manipulation", "Manipülasyon"],
    note: [
      "Scripted demonstration; no inverse-kinematics solver or object recognition is running.",
      "Önceden tanımlı gösterim; ters kinematik çözücü veya nesne tanıma çalışmıyor.",
    ],
  },
};
lessons.stand = {
  ...lessons.balance,
  title: ["Standing is active.", "Ayakta durmak aktiftir."],
  summary: [
    "A quiet pose still requires continuous sensing and coordinated support. The two feet establish the current ground contacts.",
    "Sakin bir duruş da sürekli ölçüm ve eşgüdümlü destek gerektirir. İki ayak mevcut zemin temaslarını oluşturur.",
  ],
  chain: [
    ["Ground contact", "Zemin teması"],
    ["Body measurements", "Beden ölçümleri"],
    ["State estimate", "Durum kestirimi"],
    ["Coordinated support", "Eşgüdümlü destek"],
    ["New measurements", "Yeni ölçümler"],
  ],
};
lessons["physical-ai"] = {
  title: ["Intelligence meets the world.", "Zekâ dünyayla buluşur."],
  summary: [
    "Intelligence becomes embodied behavior when computation is closed through a physical body and its environment.",
    "Hesaplama, fiziksel beden ve çevresi üzerinden kapalı bir döngü oluşturduğunda zekâ bedensel davranışa dönüşür.",
  ],
  why: [
    "Mechanics, energy, sensing, timing and contact constrain every action. A learned model can contribute to a policy or representation; the full robot still needs estimation, planning, control and feedback.",
    "Mekanik, enerji, ölçüm, zamanlama ve temas her eylemi sınırlar. Öğrenilmiş model, politikaya veya temsile katkı sunabilir; bütün robot yine de kestirim, planlama, kontrol ve geri besleme gerektirir.",
  ],
  chain: [
    ["World", "Dünya"],
    ["Sensors", "Sensörler"],
    ["Perception", "Algı"],
    ["State estimation", "Durum kestirimi"],
    ["World representation", "Dünya temsili"],
    ["Planning / policy", "Planlama / politika"],
    ["Whole-body control", "Tüm beden kontrolü"],
    ["Joint control", "Eklem kontrolü"],
    ["Motor control", "Motor kontrolü"],
    ["Actuation", "Tahrik"],
    ["Robot body", "Robot bedeni"],
    ["World → new sensor data", "Dünya → yeni sensör verisi"],
  ],
  receives: [
    "Task intent and physical observations",
    "Görev niyeti ve fiziksel gözlemler",
  ],
  produces: ["Behavior in the physical world", "Fiziksel dünyada davranış"],
  observes: ["Consequences of each action", "Her eylemin sonuçları"],
  influences: [
    "The next state of the coupled system",
    "Bağlı sistemin sonraki durumu",
  ],
  note: [
    "This is a conceptual architecture. No learned policy or physical simulation is running in HEX.",
    "Bu, kavramsal bir mimaridir. HEX içinde öğrenilmiş politika veya fiziksel simülasyon çalışmaz.",
  ],
};
lessons.joints = lessons.knee;
lessons.battery = lessons.power;
lessons.camera = lessons.perception;
lessons.realtime = lessons.compute;
lessons["motor-control"] = lessons.compute;
lessons.behavior = lessons.balance;
lessons.wrist = {
  title: ["Orient the hand.", "Eli yönlendir."],
  summary: [
    "The wrist changes hand orientation downstream of the elbow. HEX represents pitch and roll with two serial axes.",
    "El bileği, dirseğin devamında elin yönelimini değiştirir. HEX, yunuslama ve yuvarlanmayı iki seri eksenle temsil eder.",
  ],
  why: [
    "Hand position and orientation are different parts of a manipulation task. Wrist rotation adjusts the tool or grasp direction within the arm's reachable configurations.",
    "Elin konumu ve yönelimi, bir manipülasyon görevinin farklı parçalarıdır. Bilek dönmesi, kolun erişebildiği konfigürasyonlarda araç veya kavrama yönünü ayarlar.",
  ],
  chain: [
    ["Forearm", "Ön kol"],
    ["Wrist roll", "Bilek yuvarlanması"],
    ["Wrist pitch", "Bilek yunuslaması"],
    ["Hand orientation", "El yönelimi"],
  ],
  receives: ["Wrist angle targets", "Bilek açısı hedefleri"],
  produces: [
    "Hand orientation relative to the forearm",
    "Ön kola göre el yönelimi",
  ],
  observes: ["Joint encoders", "Eklem enkoderleri"],
  influences: ["Grasp and tool alignment", "Kavrama ve araç hizalaması"],
  note: [
    "The model shows serial rotational axes. No grasp forces or manipulation policy are simulated.",
    "Model, seri dönme eksenlerini gösterir. Kavrama kuvvetleri veya manipülasyon politikası simüle edilmez.",
  ],
};
lessons.data_harness = {
  title: [
    "Connect measurements and commands.",
    "Ölçümleri ve komutları bağla.",
  ],
  summary: [
    "The data harness connects sensors, distributed drives and computing modules. It carries information used by the feedback loop.",
    "Veri kablo demeti; sensörleri, dağıtık sürücüleri ve hesaplama modüllerini bağlar. Geri besleme döngüsünde kullanılan bilgiyi taşır.",
  ],
  why: [
    "Feedback depends on measurements reaching controllers and commands reaching drives. Communication timing and faults influence the control system; HEX illustrates only the connections.",
    "Geri besleme, ölçümlerin kontrolcülere ve komutların sürücülere ulaşmasına bağlıdır. İletişim zamanlaması ve hataları kontrol sistemini etkiler; HEX yalnızca bağlantıları gösterir.",
  ],
  chain: [
    ["Sensors", "Sensörler"],
    ["Data harness", "Veri kablo demeti"],
    ["Controllers", "Kontrolcüler"],
    ["Commands and status", "Komutlar ve durum"],
  ],
  receives: [
    "Measurements, commands and status messages",
    "Ölçümler, komutlar ve durum mesajları",
  ],
  produces: [
    "Information transferred between modules",
    "Modüller arasında aktarılan bilgi",
  ],
  observes: [
    "Communication diagnostics in a real implementation",
    "Gerçek uygulamada iletişim tanılaması",
  ],
  influences: [
    "Availability and timing of feedback",
    "Geri beslemenin erişilebilirliği ve zamanlaması",
  ],
  note: [
    "Routes are schematic. No bus protocol, bandwidth or communication latency is specified.",
    "Yollar şematiktir. Veri yolu protokolü, bant genişliği veya iletişim gecikmesi belirtilmez.",
  ],
};
lessons.neck = lessons.perception;
lessons.bearings = {
  ...lessons.structure,
  title: ["Support the axis.", "Ekseni destekle."],
  summary: [
    "Bearings support relative rotation while transferring radial and axial loads between a joint housing and output link.",
    "Rulmanlar, eklem gövdesi ve çıkış bağı arasında radyal ve eksenel yükleri aktarırken bağıl dönmeyi destekler.",
  ],
};
export const joints: {
  id: string;
  label: Bi;
  position: [number, number, number];
  axes: Bi;
}[] = [
  {
    id: "SHOULDER_L",
    label: ["Left shoulder", "Sol omuz"],
    position: [0.235, 1.322, 0],
    axes: [
      "3 serial axes · yaw / roll / pitch",
      "3 seri eksen · sapma / yuvarlanma / yunuslama",
    ],
  },
  {
    id: "ELBOW_L",
    label: ["Left elbow", "Sol dirsek"],
    position: [0.235, 1.025, 0],
    axes: ["1 axis · flexion / extension", "1 eksen · bükülme / uzama"],
  },
  {
    id: "HIP_L",
    label: ["Left hip", "Sol kalça"],
    position: [0.102, 0.801, 0],
    axes: [
      "3 serial axes · yaw / roll / pitch",
      "3 seri eksen · sapma / yuvarlanma / yunuslama",
    ],
  },
  {
    id: "KNEE_L",
    label: ["Left knee", "Sol diz"],
    position: [0.102, 0.487, 0],
    axes: ["1 axis · flexion / extension", "1 eksen · bükülme / uzama"],
  },
  {
    id: "ANKLE_L",
    label: ["Left ankle", "Sol ayak bileği"],
    position: [0.102, 0.133, 0],
    axes: ["2 axes · pitch / roll", "2 eksen · yunuslama / yuvarlanma"],
  },
];
export const bodies: { id: string; name: Bi }[] = [
  { id: "all", name: ["Whole body", "Tüm beden"] },
  { id: "head", name: ["Head", "Baş"] },
  { id: "torso", name: ["Torso", "Gövde"] },
  { id: "pelvis", name: ["Pelvis", "Pelvis"] },
  { id: "arm-l", name: ["Left arm", "Sol kol"] },
  { id: "arm-r", name: ["Right arm", "Sağ kol"] },
  { id: "leg-l", name: ["Left leg", "Sol bacak"] },
  { id: "leg-r", name: ["Right leg", "Sağ bacak"] },
];
export const stages: Bi[] = [
  ["Fully assembled", "Tam montaj"],
  ["Outer shell", "Dış kapaklar"],
  ["Structural frame", "Taşıyıcı iskelet"],
  ["Actuators", "Eyleyiciler"],
  ["Gears & bearings", "Dişliler ve rulmanlar"],
  ["Sensing", "Ölçüm"],
  ["Power & electronics", "Güç ve elektronik"],
  ["Compute", "Hesaplama"],
  ["The connected system", "Bağlı sistem"],
];
export const sources = [
  {
    name: "MIT · Underactuated Robotics",
    title: "Highly-articulated legged robots",
    url: "https://underactuated.csail.mit.edu/humanoids.html",
    detail: "Contact, center of pressure, momentum and balance.",
  },
  {
    name: "maxon · Drive engineering",
    title: "Gearheads for electric motors",
    url: "https://www.maxongroup.com/en-us/drives-and-systems/gears",
    detail: "Motor and reduction-stage relationships; planetary gearheads.",
  },
  {
    name: "Analog Devices · Inertial sensing",
    title: "ADIS16505 inertial measurement unit",
    url: "https://www.analog.com/en/products/adis16505.html",
    detail: "Three-axis gyroscope and accelerometer measurement classes.",
  },
  {
    name: "Blender · glTF documentation",
    title: "glTF 2.0 export",
    url: "https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html",
    detail: "Named nodes, custom properties and transform animations.",
  },
];
export const chapters: {
  title: Bi;
  question: Bi;
  mode: Mode;
  lesson: string;
}[] = [
  {
    title: ["Meet the humanoid", "Humanoid ile tanış"],
    question: ["What systems are inside?", "İçinde hangi sistemler var?"],
    mode: "explore",
    lesson: "explore",
  },
  {
    title: ["Structure", "Yapı"],
    question: ["What carries the load?", "Yükü ne taşır?"],
    mode: "structure",
    lesson: "structure",
  },
  {
    title: ["Joints", "Eklemler"],
    question: ["How can rigid links move?", "Rijit bağlar nasıl hareket eder?"],
    mode: "joints",
    lesson: "knee",
  },
  {
    title: ["Actuators", "Eyleyiciler"],
    question: ["Where does motion come from?", "Hareket nereden gelir?"],
    mode: "actuation",
    lesson: "actuation",
  },
  {
    title: ["Transmissions", "Aktarma"],
    question: ["Why use a reduction stage?", "Neden redüktör kullanılır?"],
    mode: "joints",
    lesson: "transmission",
  },
  {
    title: ["Sensors", "Sensörler"],
    question: ["How is the body measured?", "Beden nasıl ölçülür?"],
    mode: "sensors",
    lesson: "sensors",
  },
  {
    title: ["Balance", "Denge"],
    question: [
      "How does feedback support stance?",
      "Geri besleme duruşu nasıl destekler?",
    ],
    mode: "behavior",
    lesson: "balance",
  },
  {
    title: ["Power", "Güç"],
    question: ["Where does energy go?", "Enerji nereye gider?"],
    mode: "power",
    lesson: "power",
  },
  {
    title: ["Compute", "Hesaplama"],
    question: ["Which decisions happen where?", "Hangi karar nerede verilir?"],
    mode: "compute",
    lesson: "compute",
  },
  {
    title: ["Perception", "Algı"],
    question: [
      "How is a world state estimated?",
      "Dünya durumu nasıl kestirilir?",
    ],
    mode: "perception",
    lesson: "perception",
  },
  {
    title: ["Control", "Kontrol"],
    question: [
      "How does motion become feedback?",
      "Hareket nasıl geri beslemeye dönüşür?",
    ],
    mode: "control",
    lesson: "control",
  },
  {
    title: ["Physical AI", "Fiziksel Yapay Zekâ"],
    question: [
      "How does intelligence become embodied?",
      "Zekâ nasıl bedenselleşir?",
    ],
    mode: "control",
    lesson: "physical-ai",
  },
];
