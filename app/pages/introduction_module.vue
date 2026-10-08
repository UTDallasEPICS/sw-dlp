<script setup lang="ts">
    import type { Step } from '~/components/ChapterFooter.vue'

    const steps = ref<Step[]>([
        { id: 'video', icon: 'i-lucide-video', label: 'Video', status: 'current' },
        { id: 'reading', icon: 'i-lucide-book-open', label: 'Reading', status: 'upcoming' },
        { id: 'quiz', icon: 'i-lucide-list-checks', label: 'Quiz', status: 'upcoming' },
        { id: 'book', icon: 'i-lucide-book-open-text', label: 'Book', status: 'upcoming' },
        { id: 'idea', icon: 'i-lucide-lightbulb', label: 'Idea', status: 'upcoming' },
    ])

    function goPrevious() {
    // navigate to previous section
    }

    function goNext() {
    // navigate to next section
    }

    function onStepClick(stepId: string) {
    // navigate to that specific step
    console.log('Clicked step:', stepId)
    }
</script>

<template>
  <div class="pb-28">   <!-- extra bottom padding so content isn’t hidden behind the bar -->
    <div class="mx-auto max-w-6xl px-4 pb-32 pt-8">
      <h1 class="mb-6 text-3xl font-bold text-brand-500">
        Introduction
      </h1>

      <div class="space-y-5 text-base leading-relaxed text-gray-800 sm:text-lg">
        <h3 class="mt-10 text-2xl font-semibold text-gray-900">
          You can be free
        </h3>
        <p>
          This workbook is a woman’s guide to claim victory over adversity over domestic abuse 
          and other patterns of abuse in your life. You may be a survivor of domestic abuse by 
          an intimate partner, sexual abuse, emotional or verbal abuse. You may be a survivor of 
          abusive patterns from your family of origin and these memories and events follow you
          from childhood. These patterns of abuse keep resurfacing in your life and you are ready, 
          oh so ready, to be free!
        </p>
        <p>
          You may still be in your abusive situation, or perhaps you recently left. Many of you left the 
          abuse months, even years ago, but are still affected by the hurt you suffered in an abusive relationship.
        </p>
        <p>
          You feel trapped by your inability to grow beyond the hurt and to fully restore your life. 
          The fear and control remains and continues to bind you long after the situation has changed. 
          Regardless of where you are; you CAN be healed and finally free.
        </p>

        <h3 class="mt-10 text-2xl font-semibold text-gray-900">
          All are welcome
        </h3>
        <p>
          Domestic violence happens in every race, religion, culture, economic and gender group:
        </p>
        <ul class="list-disc space-y-2 pl-6">
          <li>One out of every three women will be abused at some point in her life.</li>
          <li>Battery is the single major cause of injury to women.</li>
          <li>A woman is more likely to be killed by a male partner (or former partner) than any other person.</li>
          <li>About 4,000 women die each year due to domestic violence.</li>
          <li>Of the total domestic violence homicides, about 75% of the victims were killed as they attempted to leave the relationship or after the relationship had ended.</li>
          <li>On average, a woman will leave an abusive relationship seven times before she leaves for good.</li>
        </ul>

        <p class="font-medium">
          If you are currently being abused or have survived abuse, you are not alone.
        </p>

        <!-- Brooke Jones quote -->
        <blockquote class="my-8 border-l-4 border-brand-500 bg-brand-50 px-6 py-5">
        <p class="text-lg italic leading-relaxed text-brand-700">
            “Survivors of domestic violence and patterns of abuse live all around us,
            and they fail to recognize how beautiful they are. We need to get the word
            out… We must help women know they are worthy of being loved.”
        </p>
        <footer class="mt-3 text-sm font-semibold text-brand-600">
            — Brooke Jones, Author, Stronger than Espresso
        </footer>
        </blockquote>

        <!-- Who will benefit -->
        <h2 class="mt-10 text-2xl font-semibold text-gray-900">
        Who will benefit from this book?
        </h2>

        <p class="mt-4">Women who:</p>

        <ul class="mt-3 list-disc space-y-3 pl-6">
        <li>
            Have left their abusive relationship(s) but still cannot reach their full
            potential. You are still holding on to low self-esteem and other hurtful
            behaviors due to the abuse you survived. Even still, you have hope that
            your life can be transformed.
        </li>
        <li>
            Are still in an abusive relationship, but are ready to emerge. This book
            can help you, but you still need emergency/critical care at this time.
        </li>
        </ul>

        <div class="my-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-800">
        <p class="font-medium">
            If you are in danger, contact a local family justice center, women’s
            shelter, or dial <strong>911</strong>.
        </p>
        <p class="mt-2">
            You can also contact the National Domestic Violence Hotline at
            <strong>1-800-799-7233</strong> to find resources in your area.
        </p>
        <p class="mt-2 text-sm">
            As you begin to change patterns and break away, your risks can increase
            significantly.
        </p>
        </div>

        <!-- Scripture -->
        <blockquote class="my-8 border-l-4 border-brand-400 bg-gray-50 px-6 py-4">
        <p class="italic text-gray-700">
            “Then you will call, and the Lord will answer; you will cry for help, and
            he will say: Here am I.”
        </p>
        <footer class="mt-2 text-sm font-medium text-gray-500">
            — Isaiah 58:9 (NIV)
        </footer>
        </blockquote>

        <!-- How to use this book -->
        <h2 class="mt-10 text-2xl font-semibold text-gray-900">
        How to use this book?
        </h2>

        <p class="mt-4">
        Each Chapter includes activities designed to teach and discover your thoughts
        and feelings. Distinguishing the many facets of abuse and understanding your
        role in the cycle can lead to healing. By the conclusion of this program, you
        will be armed with answers and insights to build a new foundation. Creating
        your action plan will begin your freedom from your past.
        </p>

        <p>
        God’s healing power is amazing. Self-dedication and commitment will be
        required to complete this transformation. This workbook can be used
        independently by an individual, by a leader who conducts small groups, or
        online where available. For online groups see
        <a
            href="https://www.strongerwomen.com"
            target="_blank"
            class="font-medium text-brand-500 underline hover:text-brand-600"
        >
            Stronger Women
        </a>
        for more details.
        </p>

        <blockquote class="my-8 border-l-4 border-brand-400 bg-gray-50 px-6 py-4">
        <p class="italic text-gray-700">
            “Jesus looked at them and said, ‘With man this is impossible, but with God
            all things are possible.’”
        </p>
        <footer class="mt-2 text-sm font-medium text-gray-500">
            — Matthew 19:26 (NIV)
        </footer>
        </blockquote>

        <p>
        Take time to work the exercises, answer the questions and analyze your
        feelings. Be honest with yourself. This is one time when you don’t have to
        pretend or hold a hollow smile for anyone. The more honest you are with your
        feelings the better equipped you are to rebuild a new foundation and a new
        way of life.
        </p>

        <p>
        If you have a question about an activity or need help with the workbook,
        visit
        <a
            href="https://www.strongerwomen.com"
            target="_blank"
            class="font-medium text-brand-500 underline hover:text-brand-600"
        >
            Stronger Women
        </a>
        for assistance.
        </p>

        <blockquote class="my-8 border-l-4 border-brand-400 bg-gray-50 px-6 py-4">
        <p class="italic text-gray-700">
            “Build up, build up, prepare the road! Remove the obstacles out of the way
            of my people… I have seen his ways, but I will heal him; I will guide him
            and restore comfort to him, creating praise on the lips of the mourners in
            Israel. Peace, peace, to those far and near,” says the Lord. “And I will
            heal them.”
        </p>
        <footer class="mt-2 text-sm font-medium text-gray-500">
            — Isaiah 57:14, 18, 19 (NIV)
        </footer>
        </blockquote>

        <h3 class="mt-8 text-xl font-semibold text-gray-900">The guarantee:</h3>
        <ul class="mt-3 list-disc space-y-2 pl-6">
        <li>God removes obstacles</li>
        <li>He will heal and guide you, regardless of any mistakes you have made</li>
        <li>You can have peace and be restored</li>
        </ul>

        <!-- What to expect -->
        <h2 class="mt-10 text-2xl font-semibold text-gray-900">What to expect</h2>

        <p class="mt-4">
        This workbook guides you on a personal journey to discover your patterns of
        behavior, to identify abusive relationships, to restore self-esteem and to
        build a plan of action to redefine your life. What makes this book different
        is that it is based on God’s word. It allows God’s love to emerge during the
        healing process to make your transformation last for a lifetime.
        </p>

        <p>
        Icons are used throughout the book to help organize the information:
        </p>

        <ul class="mt-3 list-disc space-y-1 pl-6">
        <li><strong>Learning Activity</strong></li>
        <li><strong>Testimonial Quote</strong></li>
        <li><strong>Scripture Reference</strong></li>
        </ul>

        <!-- Why I wrote this book -->
        <h2 class="mt-10 text-2xl font-semibold text-gray-900">
        Why I wrote this book?
        </h2>

        <p class="mt-4">This book is about hope.</p>

        <p>
        Has God ever whispered in your ear? Creating this program was a whisper from
        God many years ago, after I had survived domestic abuse. He told me that I
        had to share what I had learned in my journey. It happened when I accepted
        His great love into my heart where sustainable healing occurred.
        </p>

        <p>
        Over the years, I endured numerous abusive relationships and pulled myself
        out of the valley many times. Bad relationships and bad choices. My life was
        a repeat pattern of disappointment. Identifying these patterns through His
        love helped me heal lifelong hurts stemming back to childhood. Once our lives
        are enriched by His grace and love, true healing and transformation occur!
        Without His love, the recovery process is only temporary.
        </p>

        <p>
        During my rebuilding process I was exposed to a combination of therapy
        programs, women’s crisis centers, various educational and court-sponsored
        Victim Assistance programs. When you combine information, connect with other
        survivors and allow the healing power of God’s love into your life – A
        miracle happens!
        </p>

        <p>
        Infused with God’s love our lives change. God is the one of miracles,
        forgiveness and grace. This workbook was created to provide a Biblical
        approach to the road to recovery for anyone experiencing domestic abuse.
        </p>

        <blockquote class="my-8 border-l-4 border-brand-500 bg-brand-50 px-6 py-5">
        <p class="text-lg italic leading-relaxed text-brand-700">
            “Once He changes you, you are never, ever the same.”
        </p>
        <footer class="mt-3 text-sm font-semibold text-brand-600">
            — Brooke Jones
        </footer>
        </blockquote>

        <!-- Your great work -->
        <h2 class="mt-10 text-2xl font-semibold text-gray-900">Your great work</h2>

        <blockquote class="my-6 border-l-4 border-brand-400 bg-gray-50 px-6 py-4">
        <p class="italic text-gray-700">
            “For it is by grace you have been saved, through faith – and this not from
            yourselves, it is the gift of God – not by works, so that no one can boast.
            For we are God’s workmanship, created in Christ Jesus to do good works,
            which God prepared in advance for us to do.”
        </p>
        <footer class="mt-2 text-sm font-medium text-gray-500">
            — Ephesians 2:8–10 (NIV)
        </footer>
        </blockquote>

        <p class="font-medium">Remember:</p>
        <ul class="mt-2 list-disc space-y-2 pl-6">
        <li>Grace is God’s gift to you; it does not need to be earned</li>
        <li>God made you, and He does great work, so You = Great work</li>
        <li>You were created for a purpose</li>
        </ul>

        <!-- Objectives -->
        <h2 class="mt-10 text-2xl font-semibold text-gray-900">
        Objectives of this book
        </h2>

        <p class="mt-4">
        The Stronger than Espresso® program can be used several ways:
        </p>

        <ol class="mt-3 list-decimal space-y-2 pl-6">
        <li>Individuals can study the Participant Guide independently.</li>
        <li>Women can join a STE class in the area.</li>
        <li>
            Women can train to be a leader and launch STE classes in a new area.
            Leader guide and training is available.
        </li>
        </ol>

        <blockquote class="my-8 border-l-4 border-brand-400 bg-gray-50 px-6 py-4">
        <p class="italic text-gray-700">
            “This is the message we have heard from him and declare to you: God is
            light; in him there is no darkness at all. If we claim to have fellowship
            with him yet walk in the darkness, we lie and do not live by truth. But if
            we walk in the light, as he is in the light, we have fellowship with one
            another, and the blood of Jesus, his Son, purifies us from all sin.”
        </p>
        <footer class="mt-2 text-sm font-medium text-gray-500">
            — 1 John 1:5–7 (NIV)
        </footer>
        </blockquote>

        <!-- Personal commitment -->
        <h2 class="mt-10 text-2xl font-semibold text-gray-900">
        Personal commitment
        </h2>

        <p class="mt-4">
        As a survivor of domestic abuse I can say that I was finally jolted awake and
        able to recognize my abusive situation. The sad part was I was just repeating
        the same abusive relationships again and again. Even though I finally
        escaped, it still took another decade to learn and accept how much God loves
        me.
        </p>

        <p>
        Finally, I can claim victory over my adversity. I no longer have to be in a
        broken life-long cycle.
        </p>

        <p>
        The key ingredient to this program is God’s love and the ability to heal with
        other women. Connect, encourage and grow when you dive into the program and
        build friends in the Stronger than Espresso® Sisterhood.
        </p>

        <p>
        I have now become Stronger than Espresso, and so can you. Get ready and drink up.
        </p>

        <p class="text-lg font-semibold text-brand-600">
        You are Stronger than Espresso® and can claim victory over adversity!
        </p>

        <p class="mt-2 text-sm font-medium text-gray-600">
        — Brooke Jones, Author & Founder, Stronger than Espresso®
        </p>

        <!-- Scripture summary -->
        <h2 class="mt-10 text-2xl font-semibold text-gray-900">
        Scripture summary
        </h2>

        <p class="mt-4">
        A list of scriptures will be noted at the end of each Chapter. Reference to
        the learning objective they support will be identified. Use these scriptures
        for personal study, reflection and prayer time. Ask God to reveal to you
        areas that need prayer and healing.
        </p>

        <div class="mt-6 overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
            <thead>
            <tr class="border-b-2 border-brand-500">
                <th class="py-2 pr-4 font-semibold">Scripture</th>
                <th class="py-2 pr-4 font-semibold">Objective</th>
                <th class="py-2 font-semibold">Personal Thoughts</th>
            </tr>
            </thead>
            <tbody class="text-gray-700">
            <tr class="border-b border-gray-200">
                <td class="py-3 pr-4">Isaiah 58:9</td>
                <td class="py-3 pr-4">Self-esteem — Confidence</td>
                <td class="py-3"></td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="py-3 pr-4">Matthew 19:26</td>
                <td class="py-3 pr-4">Self-esteem — Confidence</td>
                <td class="py-3"></td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="py-3 pr-4">Isaiah 57:14, 18, 19</td>
                <td class="py-3 pr-4">Spirituality — Love</td>
                <td class="py-3"></td>
            </tr>
            <tr class="border-b border-gray-200">
                <td class="py-3 pr-4">Ephesians 2:8–10</td>
                <td class="py-3 pr-4">Spirituality — Love</td>
                <td class="py-3"></td>
            </tr>
            <tr>
                <td class="py-3 pr-4">1 John 1:5–7</td>
                <td class="py-3 pr-4">Connections — Coach</td>
                <td class="py-3"></td>
            </tr>
            </tbody>
        </table>
        </div>
      </div>
    </div>

    <!-- Footer progress bar -->
    <ChapterFooter
        chapter-title="Introduction"
        :steps="steps"
        @previous="goPrevious"
        @next="goNext"
        @step-click="onStepClick"
    />
  </div>
</template>