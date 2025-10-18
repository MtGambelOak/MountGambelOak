## The problem

If you watch sports, you know what I'm talking about. You love the game, you want to enjoy the game, but it seems like you can't escape the constant noise of THE SPONSORS trying to get you to buy something you don't want. Commercial breaks are all over the place; you might as well be watching commercials with a few short sports breaks. And while corporations pandering to college sports fandom is quite grating and really gets old after a while, it's nothing compared to the constant onslaught of DraftKings and FanDuel trying to extort money from every man who thinks they "know ball" in the country, with seemingly no regulation and an ability to mentally torture addicts who are trying to quit. All this is to say, we've had enough.

I understand leagues like the NFL and NBA are products, and advertisements are how they make a lot of their money. Yet even paid services like RedZone are introducing advertisements now, with LeaguePass perhaps following suit eventually. On top of that, these services keep getting more expensive while the quality stagnates or even goes down. As human beings, we should be able to choose what gets our attention and what doesn't. Invasive, corporate, and harmful advertisements shouldn't.

## Why conventional AdBlock doesn't work here

If you've been at all paying attention, you'd have noticed that I seem to dislike advertisements. Luckily, we have a lot of great technology today that helps me almost never have to see them! uBlock origin has been a lifesaver on desktop web browsers, and honestly, the internet is increasingly unusable without ad blockers with many ads bordering on downright malware. On mobile, Firefox Android supports extensions including uBlock, and AdGuard's DNS gets rid of most in-app ads. ReVanced helps with YouTube and YouTube Music on Android as well, though we'll see how long Google allows sideloading on Android to continue...

This setup is great, and for most of my day, I rarely see advertisements. Sure, there might be the electronic billboard here and there, but short of injecting a Neuralink into my brain or wearing those Jarvis glasses, I'll have to deal with the psychological terror of seeing a Subway ad on the way to class. As earlier stated, the real problem is with live TV broadcasts. The advertisements are directly baked into the video stream, so traditional adblock approaches or DNS filters don't work. What makes this task even more difficult is the fact that if you want to watch things live, you'd better be able to identify ads quickly, rather than just analyzing a recording with all the time in the world.

## Solving the problem

This forces us to get creative. There's a variety of approaches that could be viable here. I'll outline a few of the "more simple" ones here:

- Scan an area of the screen for a logo that the broadcasting company puts in the corner of the broadcast, that isn't present in advertisements.
- Scan the screen for some kind of scoreboard or other identifier in lieu of a reliable logo.
- Track the game state from ESPN or another API, where the most recent play is continually updated, or if it's a timeout (and occasionally) a commercial break.
- Detect commercial break transitions from visual or audio fade-ins/outs.

These ideas are great. I love these ideas. As a matter of fact, I love these ideas even more than the AI solution I'm going to describe in this post. Why? Mostly because they're simple, and in some cases, very reliable. Someone's been working on a project that incorporates the first idea, and it works like a charm: [YoutubeOverCommercials](https://github.com/RG-O/YoutubeOverCommercials)

That being said, there are just a few *slight* issues with these approaches. I'll briefly outline them:

- While logo scanning is by far the most reliable method along with being simple, not all broadcasts include a logo during their non-commercial segments!
- Scoreboards are typically present on all broadcasts, but scoreboards aren't reliably displayed during all moments of broadcast (e.g. replays), so this isn't robust enough to work, at least on its own.
- APIs don't always update on time, and are consistent with the delay that they are updated in regards to the live broadcast. Close to the end of the game, broadcasts may continue despite short timeouts, and it's difficult to account for these.
- There isn't always a visual fadeout when transitioning to commercials, and while audio fadeout is more consistent, it's difficult to differentiate it from moments of silence during the regular broadcast, etc.

This isn't meant to rag on these ideas. I think while they have issues on their own, when combined in a smart way, it might result in very robust ad detection. That being said, I wanted to try something different. Why? Because I wanted something that would work reliably and robustly, even if the broadcast didn't have a logo, or a scoreboard, or a scoreboard API. Even if the broadcast wasn't sports at all! One that's able to block advertisements that are more integrated into the broadcast.

On top of that, there have been rumors of YouTube starting to burn advertisements directly into the video streams to try and stop AdBlock users. Honestly, at that point I would probably just stop using YouTube. But a more robust approach to blocking ads could be useful in that area if the change is ever made. In the end, I just find this an interesting problem to approach, and want to learn more about Machine Learning, and this project provides a perfect opportunity to do so.

## The solution: AI (oh boy is it buzzword time?)

Yes, I'm sorry, but it's time to go *there*. It seems like AI is everywhere nowadays, because it is. At this point, people just seem to add "AI" to everything and call it a day before raking in millions from investors. Many people have soured on it as a whole due to admittedly obnoxious marketing, not to mention its adverse effects on the environment and vulnerable communities.

That being said, I find AI to be utterly captivating from an intellectual side of things. I think it has great potential to improve the world if used in a positive capacity. In my opinion, using AI to block ads is a positive application of technology.

To cut through the buzzwords, I essentially propose this. We take a live broadcast stream, and extract real-time information from it. What do I mean by "information"? Basically, anything we think is relevant to a certain portion of the broadcast being an advertisement vs content. This is going to be things like the audio, or for simplicity's sake, a transcription of the broadcast using open-source STT software. This will also include visual information from the broadcast, such as periodic screenshots. It's also definitely possible to include some of the ideas explored in the "simpler" approaches outlined earlier; logo or scoreboard detection, and scoreboard APIs in the case of live sports broadcasts.

What do we do with that information? Well, we basically just plug it all into a big black box math machine and then, an AI is born. Wait what, is that really it? At a very high level, you could maybe think of it this way. But the reality is that we need training data, and likely a lot of it. We'll give it examples of input information along with whether or not it should output "ad" or "content", and then with lots of fancy math, and lots of repetition, we can improve the classifier over time to get better at predicting given some input information. The problem is that there aren't a lot of existing datasets we can use here, so we might have to do lots of manual collection and labeling.

Something that might be very handy here is the fact that most live TV streams are broken up into very contiguous sections of ad vs content, without jumping all over the place. This might make manual labeling a bit more frictionless, since only the boundaries need to be classified. My tentative plan is just to watch sports with data collection scripts running in the background (collecting the live transcription, some screenshots, etc etc) along with timestamps, and then setting up some scripts for an easy labeling workflow after the fact.

## Training montage

Time to talk about what's likely going to be the most difficult part of this project. We have all this data, and we have a big fancy black box filled with math. That's great, but right now it doesn't know what to do. We need to teach it how to classify ads vs content based on the info it's been fed, but how do we do that?

The reality is that we need training data, and likely a lot of it. We'll give it examples of input information along with whether or not it should output "ad" or "content", and then with lots of fancy math, and lots of repetition, we can improve the classifier over time to get better at predicting given some input information. The problem is that there aren't a lot of existing datasets we can use here, so we might have to do lots of manual collection and labeling.

Something that might be very handy here is the fact that most live TV streams are broken up into very contiguous sections of ad vs content, without jumping all over the place. This might make manual labeling a bit more frictionless, since only the boundaries need to be classified. My tentative plan is just to watch sports with data collection scripts running in the background (collecting the live transcription, some screenshots, etc etc) along with timestamps, and then setting up some scripts for an easy labeling workflow after the fact.

## Other issues

There's a variety of other challenges I foresee I'll likely encounter while developing this project:

- Dealing with an over-reliance on domain-specific language when dealing with transcript data; sports include specific lingo like "huddle", "touchdown", etc, but many advertisements use similar language to pander to sports fans, which will lend to false positives when classifying content.
- Building a model that's able to deal with multimodal data, some of which may be of varying length, importance, reliability, availability, etc.
- If an ad is read during the broadcast (e.g. by an announcer), how to deal with it? What if a small ad banner is shown on some part of the screen?
- The classifier will be dealing with lots of data, some of which will be visual. This data can be computationally expensive to process, especially if we're passing it through a deep model, and if we are classifying the broadcast regularly. A balance needs to be found between speed and reliability, such that it's quick enough to run on processors that most people will have on an HTPC for example, which typically don't have discrete GPUs. CPU only computation introduces very tight computation constraints on any model developed.
- Live transcription software typically has a bit of delay between what's said and when it's actually transcribed, since more context is often needed to disambiguate (much like human speakers). This introduces delay in decision making, along with delay needed for computation. Will it be fast enough to block commercials without much delay? Will the broadcast need to be delayed by an offset for decision making?

## Is this legal?

Companies obviously aren't happy when people try to not watch their advertisements. That being said, this is a free, open source project, and we should be able to run whatever we want on our machines. There's nothing illegal (yet) about muting the TV or ignoring advertisements - this is just an automated approach to that.

## Final thoughts

I'll likely be implementing this as an open-source project hosted on GitHub. You can check my projects page for a direct link, or click the GitHub icon in the footer for a link to my GitHub profile overall. Naturally, any contributions are welcome if you find the project interesting.

I have a busy schedule this year! But I plan to try and write a development update weekly or biweekly. Writing is good and I need to do it more, and a blog helps keep me accountable, even if no one might read it.
