import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const diseases = [
  { name: "Type 2 Diabetes", vata: 1, pitta: 1, kapha: 0 },
  { name: "Rheumatoid Arthritis", vata: 1, pitta: 0, kapha: -1 },
  { name: "Asthma", vata: 1, pitta: -1, kapha: 0 },
  { name: "Gastric Ulcer", vata: -1, pitta: 1, kapha: -1 },
  { name: "Hypothyroidism", vata: -1, pitta: 0, kapha: 1 },
  { name: "Hyperthyroidism", vata: 1, pitta: 1, kapha: -1 },
  { name: "Psoriasis", vata: -1, pitta: 1, kapha: 0 },
  { name: "Eczema", vata: 1, pitta: 1, kapha: -1 },
  { name: "Atopic Dermatitis", vata: 1, pitta: 1, kapha: -1 },
  { name: "Ulcerative Colitis", vata: 1, pitta: 1, kapha: -1 },
  { name: "Irritable Bowel Syndrome", vata: 1, pitta: 0, kapha: -1 },
  { name: "Chronic Constipation", vata: 1, pitta: -1, kapha: 0 },
  { name: "Chronic Diarrhea", vata: -1, pitta: 1, kapha: -1 },
  { name: "Migraine", vata: 1, pitta: 1, kapha: -1 },
  { name: "Cluster Headache", vata: 1, pitta: 1, kapha: -1 },
  { name: "Tension Headache", vata: 1, pitta: -1, kapha: 0 },
  { name: "Anemia", vata: -1, pitta: 1, kapha: 0 },
  { name: "Pernicious Anemia", vata: 1, pitta: 1, kapha: -1 },
  { name: "Hypertension", vata: -1, pitta: 1, kapha: 0 },
  { name: "Hypotension", vata: 1, pitta: -1, kapha: 0 },
  { name: "Coronary Artery Disease", vata: -1, pitta: 1, kapha: -1 },
  { name: "Arrhythmia", vata: 1, pitta: -1, kapha: 0 },
  { name: "Non-Alcoholic Fatty Liver Disease", vata: -1, pitta: 1, kapha: 1 },
  { name: "Cirrhosis", vata: 1, pitta: 1, kapha: -1 },
  { name: "Gallstones", vata: -1, pitta: 1, kapha: -1 },
  { name: "Cholecystitis", vata: -1, pitta: 1, kapha: -1 },
  { name: "Pancreatitis", vata: -1, pitta: 1, kapha: -1 },
  { name: "Schizophrenia", vata: 1, pitta: 1, kapha: -1 },
  { name: "Bipolar Disorder", vata: 1, pitta: 1, kapha: 0 },
  { name: "Chronic Kidney Disease", vata: -1, pitta: 1, kapha: -1 },
  { name: "Kidney Stones", vata: -1, pitta: 1, kapha: -1 },
  { name: "Epilepsy", vata: 1, pitta: -1, kapha: 0 },
  { name: "Multiple Sclerosis", vata: 1, pitta: 0, kapha: -1 },
  { name: "UTI", vata: -1, pitta: 1, kapha: -1 },
  { name: "Endometriosis", vata: 1, pitta: 1, kapha: -1 },
  { name: "Polycystic Ovary Syndrome", vata: -1, pitta: 0, kapha: 1 },
  { name: "Menopause Symptoms", vata: 1, pitta: -1, kapha: 0 },
  { name: "Infertility (Female)", vata: 1, pitta: 0, kapha: -1 },
  { name: "Infertility (Male)", vata: 1, pitta: 1, kapha: -1 },
];

async function main() {
  for (const d of diseases) {
    await prisma.disease.upsert({
      where: { name: d.name },
      update: d,
      create: d,
    });
  }
}

main()
  .then(() => {
    console.log("✔ Disease Seed Completed");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
