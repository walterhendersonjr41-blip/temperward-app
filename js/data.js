/* Temperward built-in content. Works fully offline.
   Step syntax: "Plain text {t:5} {cam} {!Safety note}"
   {t:N} = timer in minutes, {cam} = good step to check with the camera, {!...} = safety note. */
(function(){
"use strict";
const TW = window.TW = window.TW || {};

TW.CATEGORIES = [
  {id:"all",   icon:"\u2B50"},
  {id:"cook",  icon:"\u{1F373}"},
  {id:"clean", icon:"\u{1F9F9}"},
  {id:"car",   icon:"\u{1F697}"},
  {id:"fix",   icon:"\u{1F527}"},
  {id:"kids",  icon:"\u{1F476}"},
  {id:"work",  icon:"\u{1F4E6}"},
  {id:"self",  icon:"\u{1F9D8}"},
  {id:"papers",icon:"\u{1F4C4}"}
];

TW.TEMPLATES = [
/* ---------------- COOKING ---------------- */
{id:"dinner", cat:"cook", icon:"\u{1F373}", name:"Cook a simple dinner", steps:[
 "Wash your hands with soap for 20 seconds. {cam}",
 "Clear and wipe your counter so you have room to work.",
 "Get out a pot, a pan, a cutting board, a knife, and a spoon. {cam}",
 "Gather your food: pasta, a jar of sauce, one onion, and a bag of frozen vegetables.",
 "Fill the pot with water, add a big pinch of salt, and put it on high heat. {!Keep pot handles turned in, away from the edge.}",
 "While the water heats, chop the onion into small pieces. {cam} {!Curl your fingertips under. Cut away from your hand.}",
 "Put the pan on medium heat with a spoon of oil. Add the onion. {!Never leave hot oil alone.}",
 "Stir the onion now and then until it's soft. About 5 minutes. {t:5} {cam}",
 "When the water is boiling, add the pasta and stir it once.",
 "Cook the pasta. Check the box, usually about 10 minutes. Stir every few minutes. {t:10}",
 "Add the sauce and frozen vegetables to the onion pan. Stir.",
 "Let the sauce simmer on low while the pasta finishes. About 5 minutes. {t:5}",
 "Turn off the burners. Carefully drain the pasta in the sink. {!Steam burns. Pour away from your face.}",
 "Mix the pasta into the sauce, plate it, and enjoy your dinner. {cam}",
 "Put leftovers in the fridge and soak the pot and pan."
]},
{id:"eggs", cat:"cook", icon:"\u{1F95A}", name:"Scrambled eggs and toast", steps:[
 "Wash your hands.",
 "Get out 2 or 3 eggs, butter or oil, salt, a bowl, a fork, a pan, and bread.",
 "Crack the eggs into the bowl. Pick out any shell. {cam}",
 "Add a pinch of salt and beat the eggs with the fork until they're one color.",
 "Put bread in the toaster.",
 "Heat the pan on medium-low. Add a little butter or oil. {!Keep the handle turned in.}",
 "Pour in the eggs. Wait 20 seconds, then slowly push them around with a spatula. {cam}",
 "Keep gently stirring until they're just set but still soft. About 2 minutes. {t:2}",
 "Turn off the heat. Put the eggs and toast on a plate. Enjoy.",
 "Rinse the pan and bowl right away so they're easy to clean."
]},
{id:"ricebeans", cat:"cook", icon:"\u{1F35A}", name:"Rice and beans", steps:[
 "Wash your hands.",
 "Get out 1 cup of rice, 1 can of beans, a pot with a lid, a small pot, salt, and a can opener.",
 "Rinse the rice in a strainer until the water runs mostly clear.",
 "Put the rice and 2 cups of water in the pot with a pinch of salt. Bring it to a boil on high.",
 "When it boils, turn the heat to low and put the lid on.",
 "Let the rice cook. Don't lift the lid. 18 minutes. {t:18}",
 "Open the beans. Pour them with their liquid into the small pot. {!Can edges are sharp.}",
 "Heat the beans on medium until they bubble, stirring now and then. About 5 minutes. {t:5}",
 "Turn off the rice and let it sit with the lid on for 5 minutes. {t:5}",
 "Fluff the rice with a fork. Serve the beans over the rice. Add hot sauce or cheese if you like. {cam}",
 "Cool leftovers, then put them in the fridge within 2 hours."
]},
{id:"lunch", cat:"cook", icon:"\u{1F96A}", name:"Pack a lunch", steps:[
 "Wash your hands and wipe the counter.",
 "Get a lunch bag or container, and an ice pack if you have one.",
 "Make a sandwich: bread, a protein like turkey, peanut butter, or eggs, plus cheese or veggies. {cam}",
 "Wrap the sandwich or put it in a container.",
 "Add a fruit, like an apple, banana, or orange.",
 "Add a snack, like crackers, nuts, or yogurt.",
 "Fill a water bottle.",
 "Put the ice pack in, close the bag, and put it by the door or in the fridge."
]},
{id:"mealprep", cat:"cook", icon:"\u{1F371}", name:"Meal prep for the week", steps:[
 "Pick 2 simple meals for the week, like rice and beans and chicken with vegetables.",
 "Write a short shopping list and check what you already have.",
 "Wash your hands and clear the counter.",
 "Start the rice or pasta first, since it takes longest. {t:18}",
 "While that cooks, chop your vegetables. {cam} {!Use a sharp knife and a steady cutting board.}",
 "Cook your protein all the way through. Chicken should have no pink inside. {cam} {!Wash hands after touching raw meat.}",
 "Let the food cool a little. 10 minutes. {t:10}",
 "Split the food into 4 or 5 containers.",
 "Label each one with the day. Put them in the fridge. Eat within 4 days.",
 "Clean up. You just saved time and money this week."
]},
/* ---------------- CLEANING ---------------- */
{id:"clean", cat:"clean", icon:"\u{1F9F9}", name:"Clean the house", steps:[
 "Put on some music and open a window for fresh air.",
 "Grab a trash bag, a laundry basket, spray cleaner, and a cloth.",
 "Walk through every room and throw away trash.",
 "Walk through again and put dirty clothes in the basket.",
 "Load or wash the dishes. Wipe the kitchen counters and stove. {cam}",
 "Clean the bathroom sink, mirror, and toilet. {!Never mix bleach with other cleaners.}",
 "Quick tidy: put things back where they belong. Set a 15 minute timer. {t:15}",
 "Dust tables and shelves with your cloth.",
 "Sweep or vacuum the floors, starting from the back of the house.",
 "Mop the kitchen and bathroom floors. {!Wet floors are slippery.}",
 "Take the trash out.",
 "Look around. You're done. Enjoy your clean space."
]},
{id:"laundry", cat:"clean", icon:"\u{1F455}", name:"Laundry", steps:[
 "Gather all your dirty clothes into one pile.",
 "Sort them: whites, darks, and towels.",
 "Check every pocket and empty them.",
 "Put one pile in the washer. Don't pack it too full. {cam}",
 "Add detergent, following the cap line. {!Keep detergent pods away from kids.}",
 "Pick the cycle: cold for darks and colors, warm for whites and towels. Press start.",
 "Wait for the wash to finish. About 35 minutes. {t:35}",
 "Move the clothes to the dryer. Clean the lint screen first. {!A full lint screen can cause a fire.}",
 "Dry them on medium heat. About 45 minutes. {t:45}",
 "Take the clothes out right away so they don't wrinkle.",
 "Fold or hang everything.",
 "Put your clothes away. Laundry done."
]},
{id:"dishes", cat:"clean", icon:"\u{1F37D}", name:"Wash dishes by hand", steps:[
 "Scrape food scraps into the trash.",
 "Fill the sink or a tub with hot, soapy water. {!Test the water. It should be hot, not burning.}",
 "Wash glasses and cups first, since they're the cleanest.",
 "Wash plates and bowls next. {cam}",
 "Wash forks, spoons, and knives. Hold knives by the handle. {!Never leave knives hidden in soapy water.}",
 "Wash pots and pans last. Soak stuck food for 10 minutes. {t:10}",
 "Rinse everything in clean water.",
 "Set them in a rack or on a towel to dry.",
 "Drain the sink and wipe it out. Done."
]},
{id:"bathroom", cat:"clean", icon:"\u{1F6BD}", name:"Clean the bathroom", steps:[
 "Open a window or turn on the fan. Put on gloves if you have them.",
 "Take everything off the counter and out of the tub.",
 "Spray the tub or shower, sink, and toilet with cleaner. Let it sit. 5 minutes. {t:5} {!Never mix bleach with ammonia or other cleaners.}",
 "Scrub the toilet bowl with the brush, then flush.",
 "Wipe the toilet seat, lid, and outside, top to bottom. {cam}",
 "Scrub the sink and faucet. Rinse.",
 "Scrub the tub or shower. Rinse it well.",
 "Clean the mirror with glass cleaner.",
 "Put things back, empty the trash, and mop the floor.",
 "Wash your hands. Bathroom done."
]},
{id:"fridge", cat:"clean", icon:"\u{1F9CA}", name:"Clean out the fridge", steps:[
 "Get a trash bag, a cloth, and warm soapy water.",
 "Take everything out of one shelf at a time.",
 "Throw away anything old, moldy, or past its date. {cam}",
 "Wipe the shelf with soapy water, then dry it.",
 "Put the good food back. Older food in front so you use it first.",
 "Repeat for each shelf and the door.",
 "Wipe the handles and the outside.",
 "Take out the trash. Write down anything you need to buy."
]},
/* ---------------- CAR ---------------- */
{id:"tire", cat:"car", icon:"\u{1F697}", name:"Change a tire", steps:[
 "Pull over to a safe, flat spot away from traffic. Turn on your hazard lights. {cam} {!Stay away from moving traffic.}",
 "Put the car in park and set the parking brake.",
 "Get the spare tire, the jack, and the lug wrench from the trunk.",
 "Put something behind a tire on the other end of the car so it won't roll.",
 "If there's a hubcap, take it off.",
 "While the tire is still on the ground, loosen each lug nut a half turn, turning left. {cam}",
 "Put the jack under the car's jack point near the flat tire. Check your owner's manual. {cam}",
 "Raise the car until the flat tire is about 6 inches off the ground. Never put any part of your body under the car. {!Never get under a car that's only on a jack.}",
 "Take the lug nuts off all the way and put them somewhere safe.",
 "Pull the flat tire off and lay it flat.",
 "Put the spare on, lining up the holes with the bolts. {cam}",
 "Screw the lug nuts on by hand as tight as you can.",
 "Lower the car until the tire touches the ground. Tighten the nuts in a star pattern.",
 "Lower the car all the way and remove the jack. Tighten the nuts one more time. {cam}",
 "Put the flat and the tools away. Drive slowly and get the tire fixed soon."
]},
{id:"oil", cat:"car", icon:"\u{1F6E2}", name:"Check your oil", steps:[
 "Park on flat ground. Turn the engine off and wait 5 minutes. {t:5} {!The engine gets hot. Don't touch metal parts.}",
 "Open the hood. Find the latch inside the car, then the second latch under the hood front.",
 "Find the dipstick. It usually has a yellow or orange ring handle. {cam}",
 "Pull it out and wipe it clean with a paper towel.",
 "Push it all the way back in, then pull it out again.",
 "Look at the tip. The oil should be between the two marks. {cam}",
 "If it's low, add a little of the oil type in your owner's manual through the cap marked with an oil can.",
 "Check again. Don't overfill.",
 "Put the dipstick back, close the cap, and shut the hood firmly."
]},
{id:"jump", cat:"car", icon:"\u{1F50B}", name:"Jump-start a car", steps:[
 "Park the good car close, nose to nose, without touching. Turn both cars off. {!Keep sparks and flames away from batteries.}",
 "Open both hoods. Find each battery and its plus (+) and minus (-) posts. {cam}",
 "Clip one red clamp to the plus post on the dead battery. {cam}",
 "Clip the other red clamp to the plus post on the good battery.",
 "Clip a black clamp to the minus post on the good battery.",
 "Clip the last black clamp to bare metal on the dead car's engine, away from the battery. {cam} {!Never let the red and black clamps touch.}",
 "Start the good car. Let it run. 3 minutes. {t:3}",
 "Try to start the dead car. If it doesn't start, wait 2 more minutes and try again.",
 "When it starts, remove the clamps in reverse order: black, black, red, red.",
 "Drive the car for at least 20 minutes so the battery charges."
]},
{id:"tirepsi", cat:"car", icon:"\u{1F6DE}", name:"Check tire pressure", steps:[
 "Find the right pressure on the sticker inside the driver's door. It says PSI.",
 "Get a tire gauge. Gas stations sell them and many air pumps have one.",
 "Take the cap off one tire's valve stem.",
 "Press the gauge straight onto the valve until the hissing stops. Read the number. {cam}",
 "If it's low, add air in short bursts, then check again.",
 "If it's too high, press the little pin in the valve to let some out.",
 "Put the cap back on.",
 "Do the same for all four tires. Check the spare too if you can."
]},
/* ---------------- HOME REPAIR ---------------- */
{id:"faucet", cat:"fix", icon:"\u{1F6B0}", name:"Fix a leaky faucet", steps:[
 "Turn off the water. Look under the sink for two small valves and turn them to the right until they stop. {cam}",
 "Turn the faucet on to make sure the water is off and let the pressure out.",
 "Put a rag in the drain so small parts can't fall in.",
 "Pop off the little cap on the handle and unscrew the handle screw. {cam}",
 "Pull off the handle. Take a photo so you remember how it goes back.",
 "Unscrew the nut and pull out the cartridge or stem. {cam}",
 "Take the old part to a hardware store and buy the exact match, or a new washer and O-ring.",
 "Put the new part in the same way the old one came out.",
 "Put the handle back on and tighten the screw.",
 "Turn the valves under the sink back on slowly, to the left. {cam}",
 "Run the water, then turn it off. Watch for drips for 1 minute. {t:1}",
 "No drip? You fixed it. Take the rag out of the drain."
]},
{id:"unclog", cat:"fix", icon:"\u{1FAA0}", name:"Unclog a sink", steps:[
 "Take out the drain stopper and clean any hair or gunk off it. {!Wear gloves if you have them.}",
 "Boil a kettle of water, or get very hot tap water. {!Don't use boiling water on plastic pipes or right after drain cleaner.}",
 "Slowly pour the hot water down the drain.",
 "If it's still slow, put a little water in the sink and use a plunger. Cover the overflow hole with a wet rag. {cam}",
 "Plunge hard 15 to 20 times, then pull up fast.",
 "Still clogged? Put a bucket under the U-shaped pipe under the sink. {cam}",
 "Unscrew the two big nuts on the U-pipe by hand and take it off. Water will spill into the bucket.",
 "Clean out the pipe with an old toothbrush or wire. {cam}",
 "Put the pipe back and tighten the nuts by hand.",
 "Run water for 1 minute and check for leaks under the sink. {t:1} {cam}",
 "If it's still clogged, call a plumber or your landlord. {!Never mix drain cleaners, and don't plunge after using one.}"
]},
{id:"switch", cat:"fix", icon:"\u{1F4A1}", name:"Change a light switch", steps:[
 "Safety first. If you rent, ask your landlord. If you're unsure at any point, stop and call an electrician. {!Electricity can kill. Do every step carefully.}",
 "Go to the breaker box and turn OFF the breaker for that room. {cam} {!Make sure the power is off before touching any wires.}",
 "Flip the light switch. The light should NOT turn on.",
 "Take off the cover plate with a screwdriver.",
 "Test the wires with a non-contact voltage tester. It must show no power. {cam} {!If the tester lights up or beeps, STOP. The power is still on.}",
 "Unscrew the switch from the box and gently pull it out. Don't touch bare metal.",
 "Take a clear photo of how the wires connect. {cam}",
 "If you see more than 2 wires plus ground, or aluminum wires, stop and call an electrician. {!Special wiring needs a pro.}",
 "Move each wire from the old switch to the same spot on the new switch. Green or bare wire goes to the green screw.",
 "Tighten every screw firmly. No bare wire should stick out. {cam}",
 "Fold the wires back in, screw the switch to the box, and put the cover plate on.",
 "Turn the breaker back on. Test the switch. Done."
]},
{id:"breaker", cat:"fix", icon:"\u26A1", name:"Reset a tripped breaker", steps:[
 "Turn off or unplug things in the room that lost power.",
 "Find the breaker box. It's often in a garage, closet, hallway, or basement.",
 "Open the door. Look for a switch that is in the middle or pointing the other way. {cam} {!Don't touch the box if it's wet, hot, or smells burnt.}",
 "Push that switch all the way OFF first.",
 "Then push it firmly back ON.",
 "Check if the power is back in the room.",
 "Plug things back in one at a time.",
 "If it trips again right away, leave it off and call an electrician or your landlord. {!A breaker that keeps tripping is a warning sign.}"
]},
{id:"wallhole", cat:"fix", icon:"\u{1F9F1}", name:"Patch a small hole in the wall", steps:[
 "Get spackle, a putty knife, and fine sandpaper. For holes bigger than a coin, get a patch kit too.",
 "Clean loose bits away from the hole.",
 "For a bigger hole, stick the mesh patch over it. {cam}",
 "Spread spackle over the hole with the putty knife. Smooth it flat. {cam}",
 "Let it dry. Check the tub, usually about 30 minutes. {t:30}",
 "Lightly sand it smooth. Wipe off the dust. {!Wear a mask if you have one.}",
 "Add a second thin coat if you can still see the hole.",
 "Paint over it to match the wall."
]},
/* ---------------- KIDS ---------------- */
{id:"diaper", cat:"kids", icon:"\u{1F476}", name:"Change a diaper", steps:[
 "Wash your hands. Get a clean diaper, wipes, and diaper cream if you use it.",
 "Lay the baby on a safe, flat spot. Keep one hand on the baby at all times. {!Never leave a baby alone on a changing table, even for a second.}",
 "Open the dirty diaper. Use the front of it to wipe away most of the mess.",
 "Lift the baby's legs gently by the ankles and wipe front to back. {cam}",
 "Fold the dirty diaper closed under the baby and slide it away.",
 "Let the skin air dry a moment. Add diaper cream if the skin is red.",
 "Slide a clean diaper under. The tabs go at the back. {cam}",
 "Pull the front up and fasten the tabs snug, but fit two fingers in the waist.",
 "Put the baby somewhere safe, throw away the diaper, and wash your hands."
]},
{id:"bottle", cat:"kids", icon:"\u{1F37C}", name:"Make a baby bottle (formula)", steps:[
 "Wash your hands well. Use a clean bottle and nipple.",
 "Read the directions on the formula can. Always follow the can.",
 "Pour the right amount of safe water into the bottle first. {cam}",
 "Add the exact number of level scoops from the can. Don't add extra water or powder. {!Wrong amounts can make a baby sick.}",
 "Put the cap on and shake well until there are no lumps.",
 "If you warm it, set the bottle in a bowl of warm water. Never use the microwave. {!Microwaves make hot spots that can burn a baby's mouth.}",
 "Test a few drops on your inner wrist. It should feel lukewarm, not hot. {cam}",
 "Feed the baby held upright. Never prop the bottle.",
 "Throw away formula left in the bottle after the feeding, within 1 hour."
]},
{id:"kidbed", cat:"kids", icon:"\u{1F6CF}", name:"Kid's bedtime", steps:[
 "Give a 10 minute warning: bedtime is soon. {t:10}",
 "Bath or wash up, then pajamas.",
 "Brush teeth together for 2 minutes. {t:2}",
 "Use the bathroom one last time.",
 "Read a short book or tell a story.",
 "Babies sleep on their back, alone, in a crib with no pillows, blankets, or toys. {!Safe sleep: back, alone, empty crib.}",
 "Say goodnight and something kind about their day.",
 "Lights low. Leave the room calmly."
]},
{id:"kidschool", cat:"kids", icon:"\u{1F392}", name:"Get kids ready for school", steps:[
 "Wake the kids up with time to spare.",
 "Bathroom, wash face, and brush teeth.",
 "Get dressed. Lay clothes out the night before to save time.",
 "Eat breakfast together. Something simple is fine.",
 "Check backpacks: homework, folders, and lunch.",
 "Shoes and coats on.",
 "Check the time and leave 5 minutes early.",
 "Tell them you love them. Have a good day."
]},
/* ---------------- JOB TASKS ---------------- */
{id:"stock", cat:"work", icon:"\u{1F6D2}", name:"Stock shelves", steps:[
 "Get your list or ask your lead which aisle to stock first.",
 "Bring the cart or boxes to the aisle. Lift with your legs, not your back. {!Bend your knees. Keep loads close to your body.}",
 "Open boxes carefully. Keep the blade pointed away from you. {cam} {!Retract the box cutter blade after every cut.}",
 "Pull the old items on the shelf to the front. This is called rotating.",
 "Put new items in the back, behind the old ones. {cam}",
 "Turn every label to face out. This is called facing.",
 "Make sure each item matches the price tag on the shelf edge. {cam}",
 "Break down empty boxes and take them to the back.",
 "Check the aisle for anything on the floor. Tell your lead you're done."
]},
{id:"cashier", cat:"work", icon:"\u{1F4B5}", name:"Cashier basics", steps:[
 "Log in to your register and count your starting cash if asked.",
 "Smile and greet the customer: Hi, did you find everything okay?",
 "Scan each item. Watch the screen to make sure each one rings up. {cam}",
 "Ask: Do you have a rewards card or coupons?",
 "Tell them the total clearly.",
 "For cash, say the amount they gave you out loud. Count the change back to them. {cam}",
 "For cards, point to the card reader and wait for approved.",
 "Bag items: heavy on the bottom, eggs and bread on top. Keep cold items together.",
 "Hand them the receipt: Thank you, have a great day!",
 "At the end, count your drawer with your manager."
]},
{id:"greet", cat:"work", icon:"\u{1F44B}", name:"Greet a customer", steps:[
 "Stand up straight, look up from your phone, and smile.",
 "Make eye contact within 10 seconds of them walking in.",
 "Say: Hi, welcome in! {cam}",
 "Ask: What can I help you find today?",
 "Listen to the whole answer. Don't interrupt.",
 "Walk them to it, or point clearly and tell them the aisle.",
 "Ask: Is there anything else I can help with?",
 "If you don't know, say: Let me find out for you. Then ask someone.",
 "End with: Thanks for coming in!"
]},
{id:"picking", cat:"work", icon:"\u{1F4E6}", name:"Warehouse order picking", steps:[
 "Put on your safety gear: vest, gloves, and safety shoes. {cam} {!Watch for forklifts. Use walkways only.}",
 "Get your pick list or scanner and a cart or tote.",
 "Read the first item: the location, the item number, and how many.",
 "Go to the location. Match the bin label to your list. {cam}",
 "Scan the item and pick the exact amount. {cam}",
 "Put it in the tote. Heavy things go on the bottom.",
 "Repeat for each line on the list.",
 "Double-check the count before you finish. {cam}",
 "Bring the tote to packing or the drop spot. Scan or mark the order complete.",
 "Lift with your legs on every heavy item. {!Ask for help or a lift for anything over 50 pounds.}"
]},
{id:"inspect", cat:"work", icon:"\u2705", name:"Inspection checklist", steps:[
 "Get the checklist and a pen, or open it on your phone.",
 "Look at the whole area or item from a few feet back. {cam}",
 "Check the first item on the list. Is it clean, working, and not damaged? {cam}",
 "Mark it pass or fail. If it fails, write why.",
 "Take a clear photo of any problem. {cam}",
 "Go through every item on the list the same way.",
 "Check safety items: exits clear, no spills, no loose cords. {cam} {!Report any danger right away.}",
 "Sign and date the checklist.",
 "Tell your supervisor about any fails before you leave."
]},
{id:"dropoff", cat:"work", icon:"\u{1F69A}", name:"Delivery drop-off", steps:[
 "Check the address and any delivery notes in your app.",
 "Park safely and legally. Turn on hazards if stopping on the street. {!Watch for traffic when getting out.}",
 "Grab the right package. Match the name and address on the label. {cam}",
 "Walk to the door. Watch out for dogs and steps.",
 "Follow the note: knock, ring, or leave at the door.",
 "Place the package out of sight from the street if you can.",
 "Take a clear photo showing the package and the door or house number. {cam}",
 "Mark it delivered in your app.",
 "Head back safely to your vehicle."
]},
{id:"firstday", cat:"work", icon:"\u{1F454}", name:"First day at a new job", steps:[
 "Lay out clean clothes and anything they told you to bring the night before.",
 "Bring your ID and Social Security card or other papers they asked for.",
 "Plan your ride. Leave early so you arrive 10 minutes before your start.",
 "Introduce yourself: Hi, I'm new today. My name is...",
 "Write down names, door codes, and what your boss tells you.",
 "Ask questions. It's normal. Say: Can you show me one more time?",
 "Put your phone away unless it's your break.",
 "At the end, ask: What time should I be here tomorrow?",
 "Say thank you. You did it."
]},
/* ---------------- SELF CARE ---------------- */
{id:"morning", cat:"self", icon:"\u{1F305}", name:"Morning routine", steps:[
 "Sit up, put both feet on the floor, and take three slow breaths.",
 "Drink a full glass of water.",
 "Make your bed.",
 "Use the bathroom and wash your face.",
 "Brush your teeth for two minutes. {t:2}",
 "Take a shower, or freshen up.",
 "Get dressed for the day.",
 "Take any medicine or vitamins you need.",
 "Eat breakfast. Something simple counts, like toast, fruit, or eggs.",
 "Look at today's plan. Pick the one most important thing to get done.",
 "Grab your keys, phone, wallet, and ID.",
 "Head out with your head up. You've got this."
]},
{id:"bedtime", cat:"self", icon:"\u{1F319}", name:"Bedtime routine", steps:[
 "Set your alarm for tomorrow.",
 "Plug in your phone to charge.",
 "Lay out your clothes for tomorrow.",
 "Put your keys, wallet, and ID by the door.",
 "Do a 5 minute tidy of the room you're in.",
 "Brush your teeth for two minutes. {t:2}",
 "Wash your face and take any night medicine.",
 "Dim the lights and put the screens away.",
 "Think of one good thing from today.",
 "Lie down and breathe slowly: in for 4, out for 6. Five minutes. {t:5}",
 "Good night. Rest well."
]},
{id:"calm", cat:"self", icon:"\u{1F33F}", name:"Calm down (stress reset)", steps:[
 "Stop what you're doing. You're safe right now.",
 "Breathe in slowly for 4 counts, hold for 4, out for 6. Do it 5 times.",
 "Name 5 things you can see.",
 "Name 4 things you can touch.",
 "Name 3 things you can hear.",
 "Drink some water.",
 "Stretch your arms up high, then let them drop. Roll your shoulders.",
 "Take a short walk if you can. 5 minutes. {t:5}",
 "Pick one small next step. Just one.",
 "If you feel like hurting yourself, call or text 988 right now. {!You don't have to handle it alone. 988 is free, 24/7.}"
]},
{id:"workout", cat:"self", icon:"\u{1F4AA}", name:"10-minute workout", steps:[
 "Clear a little space and drink some water. {!Stop if you feel pain, dizzy, or short of breath.}",
 "March in place to warm up. 1 minute. {t:1}",
 "Squats: sit back like into a chair, then stand. 10 times. {cam}",
 "Push-ups on the wall or floor. 10 times. {cam}",
 "Rest. 30 seconds. {t:0.5}",
 "Lunges: step forward and bend both knees. 5 each leg. {cam}",
 "Plank: hold a straight line on your elbows. 20 seconds. {t:0.34}",
 "Jumping jacks or step jacks. 1 minute. {t:1}",
 "Do the squats, push-ups, and lunges one more time.",
 "Cool down: walk slowly and stretch. 2 minutes. {t:2}"
]},
{id:"shower", cat:"self", icon:"\u{1F6BF}", name:"Shower and look sharp", steps:[
 "Get a towel, clean clothes, soap, and shampoo ready.",
 "Turn on the water and check that it's warm, not hot. {!Hot water can burn. Test with your hand.}",
 "Wash your hair with shampoo, then rinse.",
 "Wash your body with soap, top to bottom. Don't forget feet and behind ears.",
 "Rinse off and turn off the water.",
 "Dry off and put on deodorant.",
 "Brush your hair and teeth. Shave or trim if you want. {t:2}",
 "Put on clean clothes. Check yourself in the mirror. Looking good."
]},
/* ---------------- PAPERWORK & MONEY ---------------- */
{id:"job", cat:"papers", icon:"\u{1F4BC}", name:"Get a job", steps:[
 "Write down three kinds of jobs you could do or want to do.",
 "Make a free email address that uses your name, if you don't have one.",
 "Write your resume: your name, phone, email, past jobs, and skills. Keep it to one page.",
 "Ask someone you trust to read your resume and check for mistakes.",
 "Save your resume as a PDF on your phone or in your email.",
 "Search job sites like Indeed or your local job center for those three kinds of jobs near you.",
 "Pick five jobs you could start soon. Write them down.",
 "Apply to the first job. Give yourself about 20 minutes. {t:20}",
 "Apply to the other four jobs the same way.",
 "Write down where you applied and the date.",
 "Practice your answer to: Tell me about yourself. Say it out loud three times.",
 "Practice: Why do you want this job? and What are your strengths?",
 "Pick out clean, neat clothes for an interview.",
 "In three days, call or email each place to follow up.",
 "Keep going. Every application gets you closer."
]},
{id:"interview", cat:"papers", icon:"\u{1F91D}", name:"Get ready for an interview", steps:[
 "Look up the company. Know what they do and the job you applied for.",
 "Practice: Tell me about yourself. Keep it to 1 minute. {t:1}",
 "Practice: Why do you want this job?",
 "Think of one time you solved a problem or worked hard. Practice telling it.",
 "Write 2 questions to ask them, like: What does a normal day look like?",
 "Pick clean, neat clothes.",
 "Print or save your resume. Bring your ID.",
 "Plan your trip. Arrive 10 minutes early.",
 "In the room: smile, shake hands, and look them in the eye.",
 "Afterward, send a short thank-you message the same day."
]},
{id:"budget", cat:"papers", icon:"\u{1F4B0}", name:"Make a simple budget", steps:[
 "Write down all the money you get each month: pay, benefits, any help.",
 "Write down your must-pay bills: rent, phone, lights, ride, food.",
 "Add up the bills.",
 "Take your money minus your bills. That's what's left.",
 "If it's less than zero, circle bills you could lower or ask for a payment plan.",
 "Pick a small savings amount, even 10 dollars, and pay yourself first.",
 "Split what's left by the days until next payday. That's your daily spending money.",
 "Put your bills in the Money section of the Today tab so you get reminders."
]},
{id:"form", cat:"papers", icon:"\u{1F4DD}", name:"Fill out a form", steps:[
 "Read the whole form first before you write anything.",
 "Gather what you need: your ID, Social Security number, address, and dates.",
 "Use black or blue ink. Write in clear capital letters.",
 "Fill in your name exactly as it is on your ID. {cam}",
 "Fill in each section. If a question doesn't apply to you, write N/A.",
 "If you don't understand a question, circle it and ask for help.",
 "Check every line for mistakes. {cam}",
 "Sign and date where it says to.",
 "Take a photo or make a copy for yourself before you turn it in."
]},
{id:"paybill", cat:"papers", icon:"\u{1F9FE}", name:"Pay a bill", steps:[
 "Find the bill. Look for the amount due and the due date.",
 "Check your bank balance so you know you have enough.",
 "If you can't pay it all, call the company before the due date and ask for a payment plan.",
 "Pay on the company's real website or app, by phone, or in person. {!Never pay a bill from a link in a text you didn't expect.}",
 "Write down or screenshot the confirmation number.",
 "Mark it paid in the Money section of the Today tab."
]},
{id:"replaceid", cat:"papers", icon:"\u{1FAAA}", name:"Replace a lost state ID", steps:[
 "Look up your state's DMV or ID office website. Search: my state DMV replace ID.",
 "Find the list of documents you need. Most states ask for proof of who you are and where you live.",
 "Gather what you have: birth certificate, Social Security card, mail with your address.",
 "No address? Ask your shelter or a service center for a letter. Many states accept one.",
 "Check the fee. Ask 2-1-1 or a local charity if you need help paying it.",
 "Make an appointment if your DMV needs one.",
 "Bring all your papers. Arrive early.",
 "Keep your receipt or temporary paper until the card comes."
]},
{id:"rise", cat:"papers", icon:"\u{1F31F}", name:"Rise: get back on your feet", steps:[
 "Stage 1, documents. Find or request your birth certificate from the vital records office in the state where you were born.",
 "Stage 1, documents. Get your Social Security card replaced at ssa.gov or a Social Security office.",
 "Stage 1, documents. Get a state ID card at the DMV. Bring your birth certificate and Social Security card.",
 "Stage 2, phone. Apply for a free or low-cost phone through the Lifeline program at lifelinesupport.org.",
 "Stage 3, food and shelter. Call 2-1-1 or visit 211.org to find shelters, food banks, and free meals near you.",
 "Stage 3, food and shelter. Write down the address and hours of the closest food bank and shelter.",
 "Stage 4, benefits. Apply for SNAP food benefits at your state's benefits website or office.",
 "Stage 4, benefits. Ask 2-1-1 about Medicaid, health care, and any cash help you may qualify for.",
 "Stage 5, bank. Open a free checking account. Ask a bank or credit union for a no-fee or second-chance account.",
 "Stage 6, job. Use the Get a job goal in this app to search, apply, and prepare for interviews.",
 "Stage 6, job. Visit your local American Job Center for free job help. Find it at careeronestop.org.",
 "Stage 7, license. Call your state DMV and ask exactly what you owe or need to get your driver's license back.",
 "Stage 7, license. Make a plan to pay fines or finish requirements. Ask about payment plans.",
 "Stage 8, savings. Each payday, put a small amount into savings first, even 10 dollars.",
 "Stage 9, housing. Ask 2-1-1 and your local housing authority about rental help and housing programs. Get on the lists. You're rising."
]}
];

/* Parse a step string into {t, timer, safety, cam}. */
TW.parseStep = function(s){
  if(s && typeof s === "object") return {t:s.t||"", timer:s.timer||0, safety:s.safety||"", cam:!!s.cam};
  const o = {t:"", timer:0, safety:"", cam:false};
  o.t = String(s||"").replace(/\s*\{(t:[\d.]+|cam|![^}]*)\}/g, (m,g)=>{
    if(g==="cam") o.cam = true;
    else if(g[0]==="!") o.safety = g.slice(1).trim();
    else o.timer = Math.max(1, Math.round(parseFloat(g.slice(2))*60));
    return "";
  }).trim();
  return o;
};

/* Meal ideas -> link into cook guides */
TW.MEALS = [
  {name:"Pasta with sauce and veggies", guide:"dinner", has:["pasta","sauce","onion","vegetables"]},
  {name:"Scrambled eggs and toast", guide:"eggs", has:["eggs","bread","butter"]},
  {name:"Rice and beans", guide:"ricebeans", has:["rice","beans"]},
  {name:"Sandwich lunch", guide:"lunch", has:["bread","turkey","peanut butter","cheese"]},
  {name:"Chicken, rice and veggies (meal prep)", guide:"mealprep", has:["chicken","rice","vegetables"]},
  {name:"Breakfast for dinner: eggs and toast", guide:"eggs", has:["eggs","bread"]},
  {name:"Bean and cheese burrito bowl", guide:"ricebeans", has:["rice","beans","cheese","tortilla"]}
];

/* Chore rotation by weekday (0 = Sunday) */
TW.CHORES = {0:"mealprep", 1:"laundry", 2:"bathroom", 3:"fridge", 4:"dishes", 5:"clean", 6:"clean"};

/* ---------------- RISE: 6 gated stages ---------------- */
const L = {
  r211:["211.org — local help","https://www.211.org"],
  find:["findhelp.org — free & low-cost help","https://www.findhelp.org"],
  life:["Lifeline phone program","https://www.lifelinesupport.org"],
  ssa:["Social Security (ssa.gov)","https://www.ssa.gov"],
  w2w:["Where to get vital records (CDC)","https://www.cdc.gov/nchs/w2w/index.htm"],
  snap:["SNAP food help (USDA)","https://www.fns.usda.gov/snap"],
  hc:["HealthCare.gov","https://www.healthcare.gov"],
  cos:["CareerOneStop — job centers","https://www.careeronestop.org"],
  indeed:["Indeed jobs","https://www.indeed.com"],
  jobsnear:["Jobs near me (Google)","https://www.google.com/search?q=jobs+near+me"],
  usps:["USPS General Delivery","https://faq.usps.com/s/article/What-is-General-Delivery"],
  hud:["HUD rental help","https://www.hud.gov/topics/rental_assistance"],
  acr:["Free credit reports","https://www.annualcreditreport.com"],
  cfpb:["Consumer Finance (CFPB)","https://www.consumerfinance.gov"],
  usagov:["USA.gov benefits","https://www.usa.gov/benefits"],
  dmv:["Find your state's DMV (USA.gov)","https://www.usa.gov/state-motor-vehicle-services"]
};
TW.RISE_LINKS = L;
TW.RISE = [
 {id:"basics", icon:"\u{1F6E1}", items:[
  {id:"shelter", t:"A safe place to sleep tonight", how:["Call 2-1-1 from any phone, or go to 211.org.","Say: I need a shelter bed tonight.","Write down the address and check-in time.","Get there early. Beds can fill up.","Ask the shelter about meals, showers, and mail."], links:[L.r211,L.find]},
  {id:"food", t:"Food for today and this week", how:["Go to findhelp.org and type your ZIP code.","Pick Food, then look at food banks and free meals.","Write down 2 places with hours.","Bring a bag. Some ask for ID, many don't."], links:[L.find,L.r211]},
  {id:"phone", t:"A working phone", how:["Go to lifelinesupport.org.","Check if you qualify. SNAP, Medicaid, and other programs usually count.","Apply online or through a phone company that offers Lifeline.","Keep your phone charged. Libraries and shelters have outlets."], links:[L.life]},
  {id:"birth", t:"Birth certificate", how:["Find the vital records office for the state you were born in. The CDC page lists them all.","Follow their steps to order a copy. Ask about fee help.","Use a shelter or service address for mail if you need to.","Keep it in a safe, dry place."], links:[L.w2w]},
  {id:"ssn", t:"Social Security card", how:["Go to ssa.gov and search: replace card.","Some people can request it online. Others visit an office.","A replacement card is free.","Memorize your number and keep the card safe at home."], links:[L.ssa]},
  {id:"stateid", t:"State ID card", how:["Open the Replace a lost state ID guide in Pick and Start.","Find your state's DMV website.","Bring your birth certificate, Social Security card, and proof of address.","Ask about reduced fees if you can't pay."], links:[L.dmv], guide:"replaceid"}
 ]},
 {id:"stable", icon:"\u{1F9F1}", items:[
  {id:"mail", t:"A mailing address", how:["Ask your shelter if you can get mail there.","Or ask the post office about General Delivery.","Give this address on forms and applications."], links:[L.usps]},
  {id:"snap", t:"Apply for food benefits (SNAP)", how:["Find your state's SNAP page at the USDA link.","Apply online or at your local office.","Have your ID and any income info ready.","Go to your interview. Answer honestly."], links:[L.snap,L.usagov]},
  {id:"health", t:"Health coverage", how:["Ask 2-1-1 or go to HealthCare.gov.","Many people with low income get Medicaid.","Find a free or low-cost clinic near you."], links:[L.hc,L.r211]},
  {id:"routine", t:"Follow a daily routine for 3 days", how:["Set up the Today tab with your wake and bed times.","Do the Morning routine guide each day.","Press What do I do now? when you're not sure."], guide:"morning"},
  {id:"docs", t:"Keep your papers safe", how:["Take photos of your ID, birth certificate, and Social Security card.","Email the photos to yourself.","Keep the real papers in a zip bag in a safe place."]}
 ]},
 {id:"income", icon:"\u{1F4B5}", items:[
  {id:"resume", t:"Make a simple resume", how:["Open the Get a job guide.","Write your name, phone, email, jobs, and skills.","Ask a library or job center to print it."], guide:"job"},
  {id:"jobcenter", t:"Visit a job center", how:["Find your American Job Center at careeronestop.org.","They give free help with resumes, training, and jobs."], links:[L.cos]},
  {id:"apply5", t:"Apply to 5 jobs", how:["Search Indeed or Google jobs near you.","Pick jobs you can start soon.","Apply to 5. Write down each one."], links:[L.indeed,L.jobsnear]},
  {id:"interview", t:"Practice for interviews", how:["Run the Get ready for an interview guide.","Practice out loud 3 times."], guide:"interview"},
  {id:"gig", t:"Try a Hands-for-Hire job (demo)", how:["Open the Hire tab.","Pick a job and let the coach guide you through it."]},
  {id:"paycheck", t:"Get your first paycheck", how:["Ask your boss when payday is.","Sign up for direct deposit once you have a bank account."]}
 ]},
 {id:"rebuild", icon:"\u{1F3E6}", items:[
  {id:"bank", t:"Open a bank account", how:["Ask a credit union or bank for a no-fee or second-chance checking account.","Bring your ID and Social Security number.","Set up direct deposit with your job."], links:[L.cfpb]},
  {id:"license", t:"Get your driver's license back", how:["Call or visit your state DMV.","Ask exactly what you owe and what you need to do.","Ask about payment plans for fines."], links:[L.dmv]},
  {id:"fines", t:"Make a plan for fines or debts", how:["List each one: who, how much, due date.","Call each one and ask for a payment plan.","Put the payments in the Money section of the Today tab."]},
  {id:"ride", t:"Reliable way to get to work", how:["Map your bus route, or find a ride share with a coworker.","Ask your job or 2-1-1 about transit passes."], links:[L.r211]}
 ]},
 {id:"housing", icon:"\u{1F3E0}", items:[
  {id:"deposit", t:"Save for a deposit and first month", how:["Find out the usual rent where you want to live.","Set a savings goal: first month plus deposit.","Save a little every payday."]},
  {id:"housinghelp", t:"Apply for housing help", how:["Ask 2-1-1 and your local housing authority about programs.","Get on every waiting list you qualify for.","Check your place on the lists every month."], links:[L.hud,L.r211]},
  {id:"refs", t:"Line up 2 references", how:["Ask a boss, case worker, or pastor who knows you.","Get their name and phone number."]},
  {id:"apply", t:"Apply for a place", how:["Read the whole lease before you sign.","Ask what's included: water, lights, trash.","Never pay a deposit without seeing the place."]},
  {id:"utilities", t:"Set up lights and water", how:["Call the companies on your lease.","Ask about deposits and help programs."]}
 ]},
 {id:"growth", icon:"\u{1F4C8}", items:[
  {id:"emergency", t:"Save a $500 emergency fund", how:["Save something every payday, even $10.","Keep it in savings, not your wallet.","Only use it for real emergencies."]},
  {id:"credit", t:"Check your credit report for free", how:["Go to annualcreditreport.com. It's the official free site.","Look for mistakes and dispute them."], links:[L.acr]},
  {id:"buildcredit", t:"Start building credit", how:["Ask your bank about a secured card or credit-builder loan.","Use it for one small bill and pay it in full every month."], links:[L.cfpb]},
  {id:"skill", t:"Learn a skill or get a certificate", how:["Ask your job center about free training.","Pick one that leads to better pay."], links:[L.cos]},
  {id:"goal1yr", t:"Set a 1-year goal", how:["Write where you want to be in one year.","Break it into 4 steps, one every 3 months."]}
 ]}
];

/* ---------------- HANDS-FOR-HIRE demo seed ---------------- */
TW.DEMO_JOBS = [
  {id:"j-faucet", title:"Fix a leaky kitchen faucet", biz:"Oak St. Rentals (demo)", pay:85, place:"2 mi away", tpl:"faucet"},
  {id:"j-stock", title:"Stock the cereal aisle", biz:"Corner Market (demo)", pay:40, place:"1.2 mi away", tpl:"stock"},
  {id:"j-pick", title:"Pick 10 warehouse orders", biz:"QuickShip Depot (demo)", pay:55, place:"4 mi away", tpl:"picking"},
  {id:"j-greet", title:"Greet customers (2 hours)", biz:"Main St. Shoes (demo)", pay:36, place:"0.8 mi away", tpl:"greet"},
  {id:"j-drop", title:"Deliver 3 packages", biz:"Northside Courier (demo)", pay:24, place:"3 mi away", tpl:"dropoff"}
];
TW.DEMO_WORKERS = [
  {name:"Marcus T.", skills:["Stocking","Cashier"], rating:4.8, jobs:31},
  {name:"Dana R.", skills:["Cleaning","Greeting"], rating:4.9, jobs:57},
  {name:"Luis G.", skills:["Warehouse","Delivery"], rating:4.7, jobs:22},
  {name:"Keisha W.", skills:["Home repair","Inspection"], rating:5.0, jobs:12}
];

/* Offline phrasebook for Speaker mode (English -> Spanish) */
TW.PHRASES = [
  {en:"Hello, how can I help you?", es:"Hola, \u00bfc\u00f3mo le puedo ayudar?"},
  {en:"One moment, please.", es:"Un momento, por favor."},
  {en:"Thank you!", es:"\u00a1Gracias!"},
  {en:"I'm here to do the job you booked.", es:"Vengo a hacer el trabajo que reserv\u00f3."},
  {en:"I'm almost done.", es:"Ya casi termino."},
  {en:"The job is done. Please take a look.", es:"El trabajo est\u00e1 terminado. Por favor, rev\u00edselo."},
  {en:"Where would you like this?", es:"\u00bfD\u00f3nde lo quiere?"},
  {en:"Please stand back for safety.", es:"Por favor, al\u00e9jese por seguridad."}
];
})();
