import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/common/Button";
import { Accordion } from "../components/common/Accordion";
import studentsImage from "../assets/img-2.jpg";

export const About = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("english");

  const content = {
    english: {
      heading: "About Our Platform",
      mission: {
        title: "Our Mission",
        description:
          " Our mission is to bridge the educational resource gap by providing a comprehensive, free platform where O/L students can access everything they need to succeed.",
      },
      whoWeAre: {
        title: "Who We Are",
        description:
          "We are a team of educators, former students, and technology enthusiasts who understand the challenges faced by O/L students. Many of us have been through the same system and know how difficult it can be to find reliable study materials. That's why we created this platform - to make life easier for the next generation of students.",
      },
      whatWeOffer: {
        title: "What We Offer",
        description:
          "Our platform hosts the largest collection of O/L educational resources in Sri Lanka:",
        items: [
          "Complete past papers from 2010-2024 with official marking schemes",
          "Textbooks and reference materials for all subjects",
          "Teacher-verified revision notes and summaries",
          "Model papers designed to match current exam patterns",
          "Study guides and exam strategies",
          "Quick revision materials for last-minute preparation",
        ],
      },
      commitment: {
        title: "Our Commitment",
        description:
          "Every resource on this platform is carefully verified for accuracy and quality. We work with experienced teachers and subject experts to ensure that the materials we provide are truly helpful for exam preparation. We continuously update our collection with the latest papers and materials.",
      },
      whyFree: {
        title: "Why We're Free",
        description:
          "Education should not be limited by ability to pay. We believe that providing free access to quality resources is an investment in Sri Lanka's future. Our platform is run by volunteers and supported by the community. We will never charge for access or hide content behind paywalls.",
      },
      vision: {
        title: "Our Vision",
        description:
          "We envision a future where every O/L student in Sri Lanka, from Jaffna to Galle, from Colombo to rural villages, has the same access to quality educational resources. We want to be part of creating a more equitable education system where success is determined by effort and ability, not by access to expensive resources.",
      },
      joinMission: {
        title: "Join Our Mission",
        description:
          "If you're a teacher, student, or education enthusiast who wants to contribute, we welcome your support. You can help by:",
        items: [
          "Sharing quality resources",
          "Verifying and proofreading materials",
          "Spreading the word to students who need help",
          "Providing feedback to improve the platform",
        ],
      },
    },
    sinhala: {
      heading: "අපගේ වේදිකාව ගැන",
      mission: {
        title: "අපගේ මෙහෙවර",
        description:
          "ශ්‍රී ලංකික සෑම ශිෂ්‍යයෙකුටම ඔවුන්ගේ ස්ථානය හෝ ආර්ථික පසුබිම නොතකා ගුණාත්මක අධ්‍යාපන සම්පත් සඳහා සමාන ප්‍රවේශයක් ලැබිය යුතු බව අපි විශ්වාස කරමු. සා.පෙළ ශිෂ්‍යයන්ට සාර්ථක වීමට අවශ්‍ය සියල්ල ප්‍රවේශ කළ හැකි සම්පූර්ණ, නොමිලේ වේදිකාවක් සැපයීමෙන් අධ්‍යාපන සම්පත් පරතරය අඩු කිරීම අපගේ මෙහෙවරයි.",
      },
      whoWeAre: {
        title: "අපි කවුද",
        description:
          "අපි සා.පෙළ ශිෂ්‍යයන් මුහුණ දෙන අභියෝග තේරුම් ගන්නා අධ්‍යාපනවේදීන්, හිටපු සිසුන් සහ තාක්ෂණ ලෝලීන්ගේ කණ්ඩායමකි. අපගෙන් බොහෝ දෙනෙක් එම පද්ධතියම හරහා ගොස් ඇති අතර විශ්වාසදායක අධ්‍යයන ද්‍රව්‍ය සොයා ගැනීම කොතරම් අපහසුද යන්න දන්නෙමු. ඒ නිසාය අපි මෙම වේදිකාව නිර්මාණය කළේ - ඊළඟ පරම්පරාවේ ශිෂ්‍යයන්ට ජීවිතය පහසු කිරීමට.",
      },
      whatWeOffer: {
        title: "අපි ඉදිරිපත් කරන්නේ මොනවාද",
        description:
          "අපගේ වේදිකාව ශ්‍රී ලංකාවේ සා.පෙළ අධ්‍යාපන සම්පත්වල විශාලතම එකතුව සත්කාරකත්වය කරයි:",
        items: [
          "2010-2024 සිට නිල ලකුණු යෝජනා ක්‍රම සහිත සම්පූර්ණ අතීත ප්‍රශ්න පත්‍ර",
          "සියලුම විෂයයන් සඳහා පෙළ පොත් සහ විමර්ශන ද්‍රව්‍ය",
          "ගුරුවරුන් විසින් සත්‍යාපනය කරන ලද සංශෝධන සටහන් සහ සාරාංශ",
          "වත්මන් විභාග රටා වලට ගැලපෙන පරිදි නිර්මාණය කරන ලද ආදර්ශ ප්‍රශ්න පත්‍ර",
          "අධ්‍යයන මාර්ගෝපදේශ සහ විභාග උපාය මාර්ග",
          "අවසාන මොහොතේ සූදානම සඳහා ඉක්මන් සංශෝධන ද්‍රව්‍ය",
        ],
      },
      commitment: {
        title: "අපගේ කැපවීම",
        description:
          "මෙම වේදිකාවේ ඇති සෑම සම්පතක්ම නිරවද්‍යතාවය සහ ගුණාත්මකභාවය සඳහා ප්‍රවේශමෙන් සත්‍යාපනය කර ඇත. අපි සපයන ද්‍රව්‍ය සැබවින්ම විභාග සූදානම සඳහා ප්‍රයෝජනවත් බව සහතික කිරීම සඳහා අපි පළපුරුදු ගුරුවරුන් සහ විෂය ප්‍රවීණයන් සමඟ වැඩ කරමු. අපි අපගේ එකතුව නවතම ප්‍රශ්න පත්‍ර සහ ද්‍රව්‍ය සමඟ අඛණ්ඩව යාවත්කාලීන කරමු.",
      },
      whyFree: {
        title: "අපි නොමිලේ වන්නේ ඇයි",
        description:
          "ගෙවීමේ හැකියාව මගින් අධ්‍යාපනය සීමා නොකළ යුතුය. ගුණාත්මක සම්පත් සඳහා නොමිලේ ප්‍රවේශය සැපයීම ශ්‍රී ලංකාවේ අනාගතය සඳහා ආයෝජනයක් බව අපි විශ්වාස කරමු. අපගේ වේදිකාව ස්වේච්ඡා සේවකයන් විසින් ධාවනය කරනු ලබන අතර ප්‍රජාව විසින් සහාය දක්වනු ලැබේ. ප්‍රවේශය සඳහා අපි කිසි විටෙක ගාස්තුවක් අය නොකරමු හෝ මුදල් ගෙවීමේ බිත්ති පිටුපස අන්තර්ගතය සඟවන්නේ නැත.",
      },
      vision: {
        title: "අපගේ දැක්ම",
        description:
          "ජාෆ්නාවේ සිට ගාල්ල දක්වා, කොළඹ සිට ග්‍රාමීය ගම්මාන දක්වා, ශ්‍රී ලංකාවේ සෑම සා.පෙළ ශිෂ්‍යයෙකුටම ගුණාත්මක අධ්‍යාපන සම්පත් සඳහා සමාන ප්‍රවේශයක් ඇති අනාගතයක් අපි සිතන්නෙමු. මිල අධික සම්පත් සඳහා ප්‍රවේශය මගින් නොව, උත්සාහය සහ හැකියාව මගින් සාර්ථකත්වය තීරණය වන වඩාත් සාධාරණ අධ්‍යාපන ක්‍රමයක් නිර්මාණය කිරීමේ කොටසක් වීමට අපට අවශ්‍යය.",
      },
      joinMission: {
        title: "අපගේ මෙහෙවරට එක්වන්න",
        description:
          "ඔබ දායක වීමට අවශ්‍ය ගුරුවරයෙක්, සිසුවෙක් හෝ අධ්‍යාපන ලෝලියෙක් නම්, අපි ඔබගේ සහාය පිළිගනිමු. ඔබට උදව් කළ හැක්කේ:",
        items: [
          "ගුණාත්මක සම්පත් බෙදා ගැනීම",
          "ද්‍රව්‍ය සත්‍යාපනය සහ සෝදුපත් කිරීම",
          "උදව් අවශ්‍ය ශිෂ්‍යයන්ට වචනය පැතිරවීම",
          "වේදිකාව වැඩිදියුණු කිරීමට ප්‍රතිපෝෂණ ලබා දීම",
        ],
      },
    },
  };

  const currentContent = language === "si" ? content.sinhala : content.english;

  const sections = [
    { key: "mission", icon: "🎯", data: currentContent.mission },
    { key: "whoWeAre", icon: "👥", data: currentContent.whoWeAre },
    { key: "whatWeOffer", icon: "📚", data: currentContent.whatWeOffer },
    { key: "commitment", icon: "✅", data: currentContent.commitment },
    { key: "whyFree", icon: "💰", data: currentContent.whyFree },
    { key: "vision", icon: "🔮", data: currentContent.vision },
  ];

  const accordionItems = [
    {
      title: currentContent.mission.title,
      content: currentContent.mission.description,
    },
    {
      title: currentContent.whoWeAre.title,
      content: currentContent.whoWeAre.description,
    },
    {
      title: currentContent.whatWeOffer.title,
      content:
        currentContent.whatWeOffer.description +
        "\n" +
        currentContent.whatWeOffer.items.map((item) => `• ${item}`).join("\n"),
    },
    {
      title: currentContent.commitment.title,
      content: currentContent.commitment.description,
    },
    {
      title: currentContent.whyFree.title,
      content: currentContent.whyFree.description,
    },
    {
      title: currentContent.vision.title,
      content: currentContent.vision.description,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-14 px-4 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold">
              {language === "si" ? "අපගේ වේදිකාව ගැන" : "About Our Platform"}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              {language === "si"
                ? ""
                : "We believe every Sri Lankan student deserves equal access to quality educational resources, regardless of their location or economic background."}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {language === "si" ? "අපි කවුද" : "Who We Are"}
            </h2>
            <p className="text-muted-foreground">
              {language === "si"
                ? "ශිෂ්‍ය සාර්ථකත්වය සඳහා බලය දීම"
                : "Empowering Student Success"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="mx-auto w-full">
              <img
                className="rounded-xl"
                width="full"
                src={studentsImage}
                alt="studentsImage"
              />
            </div>
            <div className="mx-auto w-full space-y-8">
              <p className="text-lg">
                {language === "si"
                  ? "අපි ශික්ෂකයින්, හිටපු ශිෂ්‍යයින් සහ තාක්ෂණ උනන්දුවක් ඇති පුද්ගලයන්ගේ කණ්ඩායමක් වන අතර, සාමාන්‍ය පෙළ ශිෂ්‍යයින් මුහුණ දෙන අභියෝග තේරුම් ගනිමු. අපගෙන් බොහෝ දෙනෙක් ඒම පද්ධතිය හරහා ගොස් ඇති අතර විශ්වාසදායක අධ්‍යයන ද්‍රව්‍ය සොයා ගැනීම කොතරම් අපහසුද යන්න දන්නවා. ඒ නිසාම අපි මෙම වේදිකාව නිර්මාණය කළා - ඊළඟ පරපුරේ ශිෂ්‍යයින්ට ජීවිතය පහසු කර ගැනීමට."
                  : "We are a team of educators, former students, and technology enthusiasts who understand the challenges faced by O/L students. Many of us have been through the same system and know how difficult it can be to find reliable study materials. That's why we created this platform - to make life easier for the next generation of students."}
              </p>
              <div className="border border-border rounded-xl p-4 bg-card hover:shadow-lg transition-shadow">
                <div className="flex gap-4 items-center">
                  <div className="text-4xl">🎯</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Our Mission </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Our mission is to bridge the educational resource gap by
                      providing a comprehensive, free platform where O/L
                      students can access everything they need to succeed.
                    </p>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-xl p-4 bg-card hover:shadow-lg transition-shadow">
                <div className="flex gap-4 items-center">
                  <div className="text-4xl">🔮</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Our Vision</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We envision a future where every O/L student in Sri Lanka,
                      from Jaffna to Galle, from Colombo to rural villages, has
                      the same access to quality educational resources. We want
                      to be part of creating a more equitable education system
                      where success is determined by effort and ability, not by
                      access to expensive resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Content Section with Accordion */}
      <section className="py-16 px-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {language === "si"
                ? "විස්තරාත්මක තොරතුරු"
                : "Detailed Information"}
            </h2>
            <p className="text-muted-foreground">
              {language === "si"
                ? "අපගේ වේදිකාව පිළිබඳ දැන ගන්න"
                : "Learn more about our platform"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">
                {currentContent.whatWeOffer.title}
              </h2>
              <p className="mb-4">
Our platform hosts the largest collection of O/L educational resources in Sri Lanka:</p>
              <div className="space-y-4">
                {currentContent.whatWeOffer.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start border-l-4 border-amber-500 pl-4"
                  >
                    <span className="text-amber-500 font-bold text-lg">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                {currentContent.joinMission.title}
              </h2>
              <p className="text-muted-foreground mb-4">
                {currentContent.joinMission.description}
              </p>
            </div>
            <div className="space-y-1">
              {currentContent.joinMission.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-center justify-center"
                >
                  <span className="text-amber-500 text-lg">✓</span>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                {language === "si" ? "තවතර දැන්ගන්න" : "Learn More"}
              </Button>
            </div>
          </div>

          </div>
        </div>
      </section>





      {/* CTA Section */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto px-4">
          <div className=" rounded-lg p-12 text-center space-y-4 bg-card border">
            <h2 className="text-3xl font-bold">
              {language === "si"
                ? "ඉඩ ගන්න සිටින්න"
                : "Start Your Journey Today"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "si"
                ? "දැන්ම අපගේ වේදිකාව ගවේෂණ කරන්න සහ ඔබේ O/L සාර්ථකත්වයට ඉතිරි කරන්න။"
                : "Explore our platform now and take the first step towards your O/L success."}
            </p>
            <div className="pt-4 flex gap-4 justify-center flex-wrap">
              <Button
                asChild
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Link to="/resources">
                  {language === "si" ? "සම්පත් ගවේෂණ" : "Explore Resources"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">
                  {language === "si" ? "ගෙන් ආපසු යන්න" : "Back to Home"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
