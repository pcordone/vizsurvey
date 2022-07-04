export const TREATMENTS_DEV_CSV = `treatment_id,position,view_type,interaction,variable_amount,amount_earlier,time_earlier,date_earlier,amount_later,time_later,date_later,max_amount,max_time,horizontal_pixels,vertical_pixels,left_margin_width_in,bottom_margin_height_in,graph_width_in,graph_height_in,width_in,height_in,comment
1,1,word,none,none,500,2,,1000,5,,,10,,,,,,,4,4,Worded with no interaction and Read 2001 example values.
1,2,word,none,none,50,2,,300,7,,,10,,,,,,,8,8,Worded with no interaction and Read 2001 example values.
1,3,word,none,none,250,2,,1000,3,,,10,,,,,,,8,8,Worded with no interaction and Read 2001 example values.
2,1,barchart,none,none,300,2,,700,5,,1100,10,,,1,1,7,7,8.5,8.5,Barchart MEL question with no interaction inches.
2,2,barchart,none,none,500,2,,800,7,,1100,15,,,1,1,7,7,8.5,8.5,Barchart with no interaction inches.
2,3,barchart,none,none,300,2,,1000,7,,1100,15,,,1,1,3.5,3.5,4.5,4.5,Barchart with no interaction inches.
3,1,barchart,none,none,300,2,,700,5,,1100,10,800,300,,,,,,,Barchart MEL question with no interaction pixels.
3,2,barchart,none,none,300,2,,700,5,,1100,6,800,300,,,,,,,Barchart MEL question with no interaction pixels.
3,3,barchart,none,none,500,2,,800,7,,1100,15,800,300,,,,,,,Barchart with no interaction pixels.
3,4,barchart,none,none,500,2,,800,7,,1100,8,800,300,,,,,,,Barchart with no interaction pixels.
3,5,barchart,none,none,300,2,,1000,7,,1100,15,800,300,,,,,,,Barchart with no interaction pixels.
4,1,calendarBar,none,none,300,,2/1/2022,700,,2/22/2022,1100,,100,100,,,,,8,8,Calendar month view with barchart and no interaction.
4,2,calendarBar,none,none,500,,3/1/2022,800,,3/12/2022,1100,,100,100,,,,,8,8,Calendar month view with barchart and no interaction.
4,3,calendarBar,none,none,300,,4/1/2022,1000,,4/15/2022,1100,,100,100,,,,,8,8,Calendar month view with barchart and no interaction.
5,1,calendarWord,none,none,300,,2/1/2022,700,,2/22/2022,1100,,100,100,,,,,8,8,Calendar month view with word and no interaction.
5,2,calendarWord,none,none,500,,3/1/2022,800,,3/12/2022,1100,,100,100,,,,,8,8,Calendar month view with word and no interaction.
5,3,calendarWord,none,none,300,,4/1/2022,1000,,4/15/2022,1100,,100,100,,,,,8,8,Calendar month view with word and no interaction.
6,1,barchart,drag,laterAmount,500,2,,1000,10,,1500,10,100,100,0.5,0.5,8,8,8.5,8.5,Barchart with drag interaction.
7,1,calendar,drag,laterAmount,500,,2/1/2022,1000,,2/22/2022,1100,,100,100,,,,,8,8,"Read 2001 example, absolute size"
8,1,word,titration,laterAmount,500,2,,1000,3,,,10,,,,,,,8,8,Word with titration interaction.
9,1,barchart,titration,laterAmount,500,2,,1000,10,,1500,10,100,100,0.5,0.5,8,8,8.5,8.5,Barchat with titration interaction.
10,1,calendarBar,titration,laterAmount,500,,2/1/2022,1000,,2/22/2022,1100,,100,100,,,,,8,8,Calendar month view with barchart and titration interaction.
11,1,calendarWord,titration,laterAmount,500,,2/1/2022,1000,,2/22/2022,1100,,100,100,,,,,8,8,Calendar month view with word and titration interaction.
12,1,calendarBar,drag,laterAmount,500,,2/1/2022,1000,,2/22/2022,1100,,100,100,,,,,8,8,Calendar month view with barchart and drag interaction.
13,1,calendarWord,titration,laterAmount,500,,2/1/2022,1000,,10/1/2022,1100,,100,100,,,,,10,8,Calendar year view with word and titration interaction.
14,1,calendarBar,drag,laterAmount,500,,2/1/2022,1000,,10/1/2022,1100,,100,100,,,,,10,8,Calendar year view with barchart and drag interaction.
15,1,calendarWord,none,none,300,,2/1/2022,700,,5/22/2022,1100,,100,100,,,,,10,8,Calendar year view with word and no interaction.
15,2,calendarWord,none,none,500,,3/1/2022,800,,6/12/2022,1100,,100,100,,,,,10,8,Calendar year view with word and no interaction.
15,3,calendarWord,none,none,300,,4/1/2022,1000,,7/15/2022,1100,,100,100,,,,,10,8,Calendar year view with word and no interaction.
16,1,calendarBar,none,none,300,,2/1/2022,700,,5/22/2022,1100,,100,100,,,,,10,8,Calendar year view with bar and no interaction.
16,2,calendarBar,none,none,500,,3/1/2022,800,,6/12/2022,1100,,100,100,,,,,10,8,Calendar year view with bar and no interaction.
16,3,calendarBar,none,none,300,,4/1/2022,1000,,7/15/2022,1100,,100,100,,,,,10,8,Calendar year view with bar and no interaction.
17,1,calendarIcon,none,none,300,,2/1/2022,700,,5/22/2022,1100,,100,100,,,,,10,8,Calendar year view with icon and no interaction.
17,2,calendarIcon,none,none,500,,3/1/2022,800,,6/12/2022,1100,,100,100,,,,,10,8,Calendar year view with icon and no interaction.
17,3,calendarIcon,none,none,300,,4/1/2022,1000,,7/15/2022,1100,,100,100,,,,,10,8,Calendar year view with icon and no interaction.
18,1,calendarIcon,none,none,300,,2/1/2022,700,,2/22/2022,1100,,100,100,,,,,8,8,Calendar month view with icon and no interaction.
18,2,calendarIcon,none,none,500,,3/1/2022,800,,3/12/2022,1100,,100,100,,,,,8,8,Calendar month view with icon and no interaction.
18,3,calendarIcon,none,none,300,,4/1/2022,1000,,4/15/2022,1100,,100,100,,,,,8,8,Calendar month view with icon and no interaction.
19,1,calendarIcon,titration,laterAmount,300,,2/1/2022,700,,2/22/2022,1100,,100,100,,,,,8,8,Calendar month view with icon and titration interaction.
19,2,calendarIcon,titration,laterAmount,500,,3/1/2022,800,,3/12/2022,1100,,100,100,,,,,8,8,Calendar month view with icon and titration interaction.
19,3,calendarIcon,titration,laterAmount,300,,4/1/2022,1000,,4/15/2022,1100,,100,100,,,,,8,8,Calendar month view with icon and titration interaction.
`;
