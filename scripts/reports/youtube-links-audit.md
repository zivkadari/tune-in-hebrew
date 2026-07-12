# YouTube Links Content Audit

Generated: 2026-07-12T20:42:37.593Z

Source: `scripts/fixtures/platform-links-approved.ts`, which is synchronized by explicit song ID with the Google Sheet.
Method: fetched YouTube oEmbed metadata for every `youtubeUrl`, checked the expected video ID, and compared the actual video title/channel against the verified audit metadata.

## Summary

- Correct links: 55
- Wrong-song links: 0
- Unavailable links: 0
- Uncertain links: 0

## Pre-fix findings and verified corrections

The original Google Sheet `youtube_url` values for IDs 2–30 formed a closed shifted cycle: ID 2 opened ID 30, and IDs 3–30 each opened the previous song ID. The replacement URLs below were verified by YouTube oEmbed metadata before being applied by explicit Song_num/ID.

| ID | Expected song | Expected artist | Pre-fix URL opened | Pre-fix actual video title | Pre-fix actual author/channel | Status | Verified replacement URL |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 2 | ממעמקים | עידן רייכל | https://www.youtube.com/watch?v=kJnOQQ815LQ | משה פרץ ואגם בוחבוט - ילדה קטנה (קליפ) | משה פרץ | wrong song | https://www.youtube.com/watch?v=kmW2yAYhMmM |
| 3 | השקט שנשאר | שירי מימון | https://www.youtube.com/watch?v=kmW2yAYhMmM | The Idan Raichel Project - הפרויקט של עידן רייכל - ממעמקים | Idan Raichel - עידן רייכל | wrong song | https://www.youtube.com/watch?v=_xsI9tgyj1A |
| 4 | הילדה הכי יפה בגן | יהודית רביץ | https://www.youtube.com/watch?v=_xsI9tgyj1A | שירי מימון - השקט שנשאר - קליפ | הערוץ הרשמי של שירי מימון | wrong song | https://www.youtube.com/watch?v=bhNYlOt00uw |
| 5 | פנתרה | נועה קירל | https://www.youtube.com/watch?v=bhNYlOt00uw | יהודית רביץ - הילדה הכי יפה בגן | מוזיקה ישראלית | wrong song | https://www.youtube.com/watch?v=ZOf7aMbzQAM |
| 6 | רולקס וקסקט | עדן בן זקן | https://www.youtube.com/watch?v=ZOf7aMbzQAM | נועה קירל - פנתרה (Prod. By Jordi) | Noa Kirel | wrong song | https://www.youtube.com/watch?v=7nVoHd4iFuw |
| 7 | מסע ומתן | מוש בן-ארי | https://www.youtube.com/watch?v=7nVoHd4iFuw | עדן בן זקן - רולקס וקסקט (Prod. By Bleu) | עדן בן זקן - הערוץ הרשמי | wrong song | https://www.youtube.com/watch?v=990F-bdP_k4 |
| 8 | אלוף העולם | חנן בן ארי | https://www.youtube.com/watch?v=990F-bdP_k4 | מסע ומתן | Mosh Ben Ari - Topic | wrong song | https://www.youtube.com/watch?v=jlCNqyY-fAk |
| 9 | לילות וקללות | עומר אדם | https://www.youtube.com/watch?v=jlCNqyY-fAk | חנן בן ארי - אלוף העולם (קליפ רשמי) Hanan Ben Ari | Hanan Ben Ari Official חנן בן ארי הערוץ הרשמי | wrong song | https://www.youtube.com/watch?v=isCbysjdcQ0 |
| 10 | סהרה | טונה | https://www.youtube.com/watch?v=isCbysjdcQ0 | עומר אדם - לילות וקללות (Prod. By Bleu) | עומר אדם - הערוץ הרשמי | wrong song | https://www.youtube.com/watch?v=dZWlObNQoZ4 |
| 11 | שווים | עילי בוטנר ורן דנקר | https://www.youtube.com/watch?v=dZWlObNQoZ4 | טונה - סהרה | Tuna Official | wrong song | https://www.youtube.com/watch?v=lf72w9CMB-I |
| 12 | אור גדול | אמיר דדון | https://www.youtube.com/watch?v=lf72w9CMB-I | עילי בוטנר ורן דנקר - שווים | עילי בוטנר - Elai Botner | wrong song | https://www.youtube.com/watch?v=GQWKEP0qOfE |
| 13 | הלב שלי | ישי ריבו | https://www.youtube.com/watch?v=GQWKEP0qOfE | אמיר דדון - אור גדול | Amir Dadon - אמיר דדון | wrong song | https://www.youtube.com/watch?v=6U_5KhaH6IM |
| 14 | מה יהיה מחר | פאר טסי | https://www.youtube.com/watch?v=6U_5KhaH6IM | ישי ריבו - הלב שלי \| Ishay Ribo - Halev Sheli | ישי ריבו \| Ishay Ribo | wrong song | https://www.youtube.com/watch?v=Iay1xdXljb4 |
| 15 | עדיין ריק | לירן דנינו | https://www.youtube.com/watch?v=Iay1xdXljb4 | פאר טסי - מה יהיה מחר (Prod.by Matan Dror) | פאר טסי Peer Tasi | wrong song | https://www.youtube.com/watch?v=ImMFBmqIPOc |
| 16 | מסע | אליעד | https://www.youtube.com/watch?v=ImMFBmqIPOc | לירן דנינו - עדיין ריק | LiranDaninoMusic | wrong song | https://www.youtube.com/watch?v=zRIn7W-kXhs |
| 17 | יהיה טוב | יסמין מועלם | https://www.youtube.com/watch?v=zRIn7W-kXhs | אליעד - מסע | Eliad | wrong song | https://www.youtube.com/watch?v=qvdQ4mGMVkg |
| 18 | כפיות | עדן חסון | https://www.youtube.com/watch?v=qvdQ4mGMVkg | יסמין מועלם - יהיה טוב | Jasmin Moallem | wrong song | https://www.youtube.com/watch?v=pzAmYC7Xxtw |
| 19 | כל מה שיש לי | נתן גושן | https://www.youtube.com/watch?v=pzAmYC7Xxtw | עדן חסון - כפיות \| Eden Hason - Kapiyot | עדן חסון - Eden Hason | wrong song | https://www.youtube.com/watch?v=yRZm0shwfw8 |
| 20 | השיר שלנו | אביב גפן | https://www.youtube.com/watch?v=yRZm0shwfw8 | נתן גושן כל מה שיש לי קליפ Natan Goshen | Nathan Goshen Official נתן גושן הערוץ הרשמי | wrong song | https://www.youtube.com/watch?v=aAManNYfWgU |
| 21 | אהבה | אושר כהן | https://www.youtube.com/watch?v=aAManNYfWgU | אביב גפן - השיר שלנו | מוזיקה ישראלית | wrong song | https://www.youtube.com/watch?v=K1nQX_hdop0 |
| 22 | נגעת לי בלב | אייל גולן | https://www.youtube.com/watch?v=K1nQX_hdop0 | אושר כהן - אהבה | Osher Cohen Music | wrong song | https://www.youtube.com/watch?v=bzZtDkMueUA |
| 23 | התקווה | סאבלימינל והצל | https://www.youtube.com/watch?v=bzZtDkMueUA | אייל גולן נגעת לי בלב Eyal Golan | EyalGolanOfficial | wrong song | https://www.youtube.com/watch?v=qBPYU93OkOs |
| 24 | איזה עולם | טיפקס | https://www.youtube.com/watch?v=qBPYU93OkOs | סאבלימינל והצל - התקווה (הקליפ הרשמי) | TACT RECORDS תאקט רקורדס | wrong song | https://www.youtube.com/watch?v=qF0gBrO4gIY |
| 25 | עוף מוזר | פאר טסי | https://www.youtube.com/watch?v=qF0gBrO4gIY | טיפקס - איזה עולם | TeaPacks | wrong song | https://www.youtube.com/watch?v=mv_JuLI-8lk |
| 26 | חופשייה | שרית חדד | https://www.youtube.com/watch?v=mv_JuLI-8lk | פאר טסי - עוף מוזר (Prod. By TALISMAN & MARKO) | פאר טסי Peer Tasi | wrong song | https://www.youtube.com/watch?v=g0fsM6Elu5c |
| 27 | מרי לו | צביקה פיק | https://www.youtube.com/watch?v=g0fsM6Elu5c | שרית חדד - חופשייה - Sarit Hadad - Free | SaritHadadOfficial | wrong song | https://www.youtube.com/watch?v=bbsMP75sPws |
| 28 | אף אחת | מירי מסיקה | https://www.youtube.com/watch?v=bbsMP75sPws | צביקה פיק מרי לו Svika Pick | SvikaPickOfficial | wrong song | https://www.youtube.com/watch?v=SGIYmCdtbzg |
| 29 | השיר שאת אהבת | עומר אדם | https://www.youtube.com/watch?v=SGIYmCdtbzg | מירי מסיקה   אף אחת מתוך האלבום 'מירי מסיקה' | MiriMesikaOfficial | wrong song | https://www.youtube.com/watch?v=NeD0QwiLkdY |
| 30 | ילדה קטנה | משה פרץ ואגם בוחבוט | https://www.youtube.com/watch?v=NeD0QwiLkdY | עומר אדם – השיר שאת אהבת   (Prod. By Bleu) | עומר אדם - הערוץ הרשמי | wrong song | https://www.youtube.com/watch?v=kJnOQQ815LQ |

## Audit table

| ID | Expected song | Expected artist | YouTube URL | Expected video ID | Actual video title | Actual video author/channel | Status |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | צליל מיתר | אייל גולן | https://www.youtube.com/watch?v=oKLLyDOczbY | oKLLyDOczbY | אייל גולן צליל מיתר Eyal Golan | EyalGolanOfficial | correct |
| 2 | ממעמקים | עידן רייכל | https://www.youtube.com/watch?v=kmW2yAYhMmM | kmW2yAYhMmM | The Idan Raichel Project - הפרויקט של עידן רייכל - ממעמקים | Idan Raichel - עידן רייכל | correct |
| 3 | השקט שנשאר | שירי מימון | https://www.youtube.com/watch?v=_xsI9tgyj1A | _xsI9tgyj1A | שירי מימון - השקט שנשאר - קליפ | הערוץ הרשמי של שירי מימון | correct |
| 4 | הילדה הכי יפה בגן | יהודית רביץ | https://www.youtube.com/watch?v=bhNYlOt00uw | bhNYlOt00uw | יהודית רביץ - הילדה הכי יפה בגן | מוזיקה ישראלית | correct |
| 5 | פנתרה | נועה קירל | https://www.youtube.com/watch?v=ZOf7aMbzQAM | ZOf7aMbzQAM | נועה קירל - פנתרה (Prod. By Jordi) | Noa Kirel | correct |
| 6 | רולקס וקסקט | עדן בן זקן | https://www.youtube.com/watch?v=7nVoHd4iFuw | 7nVoHd4iFuw | עדן בן זקן - רולקס וקסקט (Prod. By Bleu) | עדן בן זקן - הערוץ הרשמי | correct |
| 7 | מסע ומתן | מוש בן-ארי | https://www.youtube.com/watch?v=990F-bdP_k4 | 990F-bdP_k4 | מסע ומתן | Mosh Ben Ari - Topic | correct |
| 8 | אלוף העולם | חנן בן ארי | https://www.youtube.com/watch?v=jlCNqyY-fAk | jlCNqyY-fAk | חנן בן ארי - אלוף העולם (קליפ רשמי) Hanan Ben Ari | Hanan Ben Ari Official חנן בן ארי הערוץ הרשמי | correct |
| 9 | לילות וקללות | עומר אדם | https://www.youtube.com/watch?v=isCbysjdcQ0 | isCbysjdcQ0 | עומר אדם - לילות וקללות (Prod. By Bleu) | עומר אדם - הערוץ הרשמי | correct |
| 10 | סהרה | טונה | https://www.youtube.com/watch?v=dZWlObNQoZ4 | dZWlObNQoZ4 | טונה - סהרה | Tuna Official | correct |
| 11 | שווים | עילי בוטנר ורן דנקר | https://www.youtube.com/watch?v=lf72w9CMB-I | lf72w9CMB-I | עילי בוטנר ורן דנקר - שווים | עילי בוטנר - Elai Botner | correct |
| 12 | אור גדול | אמיר דדון | https://www.youtube.com/watch?v=GQWKEP0qOfE | GQWKEP0qOfE | אמיר דדון - אור גדול | Amir Dadon - אמיר דדון | correct |
| 13 | הלב שלי | ישי ריבו | https://www.youtube.com/watch?v=6U_5KhaH6IM | 6U_5KhaH6IM | ישי ריבו - הלב שלי \| Ishay Ribo - Halev Sheli | ישי ריבו \| Ishay Ribo | correct |
| 14 | מה יהיה מחר | פאר טסי | https://www.youtube.com/watch?v=Iay1xdXljb4 | Iay1xdXljb4 | פאר טסי - מה יהיה מחר (Prod.by Matan Dror) | פאר טסי Peer Tasi | correct |
| 15 | עדיין ריק | לירן דנינו | https://www.youtube.com/watch?v=ImMFBmqIPOc | ImMFBmqIPOc | לירן דנינו - עדיין ריק | LiranDaninoMusic | correct |
| 16 | מסע | אליעד | https://www.youtube.com/watch?v=zRIn7W-kXhs | zRIn7W-kXhs | אליעד - מסע | Eliad | correct |
| 17 | יהיה טוב | יסמין מועלם | https://www.youtube.com/watch?v=qvdQ4mGMVkg | qvdQ4mGMVkg | יסמין מועלם - יהיה טוב | Jasmin Moallem | correct |
| 18 | כפיות | עדן חסון | https://www.youtube.com/watch?v=pzAmYC7Xxtw | pzAmYC7Xxtw | עדן חסון - כפיות \| Eden Hason - Kapiyot | עדן חסון - Eden Hason | correct |
| 19 | כל מה שיש לי | נתן גושן | https://www.youtube.com/watch?v=yRZm0shwfw8 | yRZm0shwfw8 | נתן גושן כל מה שיש לי קליפ Natan Goshen | Nathan Goshen Official נתן גושן הערוץ הרשמי | correct |
| 20 | השיר שלנו | אביב גפן | https://www.youtube.com/watch?v=aAManNYfWgU | aAManNYfWgU | אביב גפן - השיר שלנו | מוזיקה ישראלית | correct |
| 21 | אהבה | אושר כהן | https://www.youtube.com/watch?v=K1nQX_hdop0 | K1nQX_hdop0 | אושר כהן - אהבה | Osher Cohen Music | correct |
| 22 | נגעת לי בלב | אייל גולן | https://www.youtube.com/watch?v=bzZtDkMueUA | bzZtDkMueUA | אייל גולן נגעת לי בלב Eyal Golan | EyalGolanOfficial | correct |
| 23 | התקווה | סאבלימינל והצל | https://www.youtube.com/watch?v=qBPYU93OkOs | qBPYU93OkOs | סאבלימינל והצל - התקווה (הקליפ הרשמי) | TACT RECORDS תאקט רקורדס | correct |
| 24 | איזה עולם | טיפקס | https://www.youtube.com/watch?v=qF0gBrO4gIY | qF0gBrO4gIY | טיפקס - איזה עולם | TeaPacks | correct |
| 25 | עוף מוזר | פאר טסי | https://www.youtube.com/watch?v=mv_JuLI-8lk | mv_JuLI-8lk | פאר טסי - עוף מוזר (Prod. By TALISMAN & MARKO) | פאר טסי Peer Tasi | correct |
| 26 | חופשייה | שרית חדד | https://www.youtube.com/watch?v=g0fsM6Elu5c | g0fsM6Elu5c | שרית חדד - חופשייה - Sarit Hadad - Free | SaritHadadOfficial | correct |
| 27 | מרי לו | צביקה פיק | https://www.youtube.com/watch?v=bbsMP75sPws | bbsMP75sPws | צביקה פיק מרי לו Svika Pick | SvikaPickOfficial | correct |
| 28 | אף אחת | מירי מסיקה | https://www.youtube.com/watch?v=SGIYmCdtbzg | SGIYmCdtbzg | מירי מסיקה   אף אחת מתוך האלבום 'מירי מסיקה' | MiriMesikaOfficial | correct |
| 29 | השיר שאת אהבת | עומר אדם | https://www.youtube.com/watch?v=NeD0QwiLkdY | NeD0QwiLkdY | עומר אדם – השיר שאת אהבת   (Prod. By Bleu) | עומר אדם - הערוץ הרשמי | correct |
| 30 | ילדה קטנה | משה פרץ ואגם בוחבוט | https://www.youtube.com/watch?v=kJnOQQ815LQ | kJnOQQ815LQ | משה פרץ ואגם בוחבוט - ילדה קטנה (קליפ) | משה פרץ | correct |
| 31 | נגמר | עידן עמדי | https://www.youtube.com/watch?v=x7wrPEatuk4 | x7wrPEatuk4 | Idan Amedi \| עידן עמדי - נגמר | עידן עמדי Idan Amedi | correct |
| 32 | מסיבה | יסמין מועלם | https://www.youtube.com/watch?v=RsErNvzEQ5I | RsErNvzEQ5I | יסמין מועלם - מסיבה (עם שקל) | Jasmin Moallem | correct |
| 33 | ואת | הראל סקעת | https://www.youtube.com/watch?v=ARKJfrMM29E | ARKJfrMM29E | הראל סקעת - ואת \| קליפ | הראל סקעת - Harel Skaat | correct |
| 34 | ואז תבואי | הראל מויאל | https://www.youtube.com/watch?v=32oVRcayvSU | 32oVRcayvSU | הראל מויאל ואז תבואי Harel Moyal | הראל מויאל - Harel Moyal | correct |
| 35 | מעליות | דודו טסה | https://www.youtube.com/watch?v=yjE8RgR4m-c | yjE8RgR4m-c | דודו טסה עם רוני אלטר \| מעליות | דודו טסה | correct |
| 36 | האחת שלי | ישי לוי | https://www.youtube.com/watch?v=hYQcf8H8yJE | hYQcf8H8yJE | ישי לוי האחת שלי Ishay Levi | Ishay Levi Official ישי לוי הערוץ הרשמי | correct |
| 37 | יחפים | יסמין מועלם | https://www.youtube.com/watch?v=Dcvm3PpOuiA | Dcvm3PpOuiA | יסמין מועלם - יחפים | Jasmin Moallem | correct |
| 38 | סימני הזמן | משה פרץ | https://www.youtube.com/watch?v=WaO47gh0fVw | WaO47gh0fVw | משה פרץ - סימני הזמן Moshe Perez | משה פרץ | correct |
| 39 | אם את עדיין אוהבת | בועז שרעבי | https://www.youtube.com/watch?v=9JTgv3QV6bI | 9JTgv3QV6bI | בועז שרעבי - אם את עדיין אוהבת אותי (קליפ) | מוזיקה ישראלית | correct |
| 40 | אם זה זה | אגם בוחבוט | https://www.youtube.com/watch?v=PMKjbR5LQKo | PMKjbR5LQKo | אגם בוחבוט - אם זה זה זה זה  (Prod. By Navi ) | אגם בוחבוט - הערוץ הרשמי | correct |
| 41 | יפה כלבנה | אביתר בנאי | https://www.youtube.com/watch?v=NpSosoi5biU | NpSosoi5biU | אביתר בנאי - יפה כלבנה - קליפ | אביתר בנאי | correct |
| 42 | לכל אחד | שלומי שבת | https://www.youtube.com/watch?v=wOSyYscrXLE | wOSyYscrXLE | לכל אחד יש - שלומי שבת וליאור נרקיס (ביצוע מקורי) | עוזי חיטמן - Uzi Hitman | correct |
| 43 | נוף אחר | יוני בלוך | https://www.youtube.com/watch?v=EsyWY3MWApQ | EsyWY3MWApQ | נוף אחר | Yoni Bloch - Topic | correct |
| 44 | הולכת איתך | נרקיס | https://www.youtube.com/watch?v=wSQCw8IEjOA | wSQCw8IEjOA | נרקיס - הולכת איתך (Prod. By Yinon Yahel) \| Narkis | נרקיס Narkis | correct |
| 45 | הלילה יעבור | יפתי | https://www.youtube.com/watch?v=23-PoqDc7yM | 23-PoqDc7yM | הלילה יעבור | יפתי - Topic | correct |
| 46 | פתאום כשלא באת | שלמה ארצי | https://www.youtube.com/watch?v=zFtMTQMJtp0 | zFtMTQMJtp0 | שלמה ארצי וגרי אקשטיין - פתאום כשלא באת \| קליפ | ShlomoArtziOfficial | correct |
| 47 | פחד אלוהים | כפיר צפריר | https://www.youtube.com/watch?v=kBLdR1J8Je4 | kBLdR1J8Je4 | כפיר צפריר – פחד אלוהים \| Kfir Tsafrir - Fear of God | Kfir Tsafrir Official | correct |
| 48 | נשימה | חן אהרוני ואסתי גינזבורג | https://www.youtube.com/watch?v=kzMZO0H-rEU | kzMZO0H-rEU | חן אהרוני ואסתי גינזבורג נשימה Chen Aharoni | ChenAharoniOfficial | correct |
| 49 | שאריות מעצמי | שיר לוי | https://www.youtube.com/watch?v=3w3VtH2AcDU | 3w3VtH2AcDU | שיר לוי שאריות מעצמי Shir Levi | ShirLeviOfficial | correct |
| 50 | גוליית | כוורת | https://www.youtube.com/watch?v=82Mr8O7TUfI | 82Mr8O7TUfI | כוורת - גוליית \| קליפ | להקת כוורת | correct |
| 51 | לא להיות לבד | מרגי | https://www.youtube.com/watch?v=7k-A8mQ7Hmo | 7k-A8mQ7Hmo | מרגי - לא להיות לבד \| Mergui  (Prod. by Jordi) | Mergui | correct |
| 52 | ניצחת איתי הכל | עמיר בניון | https://www.youtube.com/watch?v=pRQX6Xp2B48 | pRQX6Xp2B48 | עמיר בניון - ניצחת איתי הכל - קליפ | Helicon Music - הליקון | correct |
| 53 | שמים | יגאל בשן | https://www.youtube.com/watch?v=VfIJSc6KWWk | VfIJSc6KWWk | יגאל בשן - שמים | יגאל בשן - הערוץ הרשמי | correct |
| 54 | אייכה | שולי רנד | https://www.youtube.com/watch?v=HqqrOod1fK4 | HqqrOod1fK4 | שולי רנד - אייכה | שולי רנד | correct |
| 55 | ביום שניפגש | דודו אהרון | https://www.youtube.com/watch?v=24qN5CxA758 | 24qN5CxA758 | דודו אהרון - ביום שניפגש | דודו אהרון הערוץ הרשמי | correct |
