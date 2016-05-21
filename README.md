<section class="page-header">

# Stirfry

## StirFry is a self contained and lightweight web framework for nodejs

[View on GitHub](https://github.com/StirFry-js/stirfry) [Download .zip](https://github.com/StirFry-js/stirfry/zipball/master) [Download .tar.gz](https://github.com/StirFry-js/stirfry/tarball/master)</section>

<section class="main-content">

# [<span aria-hidden="true" class="octicon octicon-link"></span>](#stir-fry)Stir Fry

Stir fry is a **_fast_**, **_lightweight_**, and **_easy to use_** web framework.

#### [<span aria-hidden="true" class="octicon octicon-link"></span>](#creating-your-first-server)Creating your first server

<div class="highlight highlight-source-js">

<pre><span class="pl-k">var</span> StirFry <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">'</span>stirfry<span class="pl-pds">'</span></span>);
<span class="pl-k">var</span> server  <span class="pl-k">=</span> <span class="pl-k">new</span> <span class="pl-en">StirFry</span>(<span class="pl-c1">8080</span>);
<span class="pl-smi">server</span>.<span class="pl-en">request</span>(<span class="pl-k">function</span> (<span class="pl-smi">request</span>, <span class="pl-smi">response</span>) {
    <span class="pl-smi">response</span>.<span class="pl-c1">send</span>(<span class="pl-s"><span class="pl-pds">"</span>Hello World!<span class="pl-pds">"</span></span>);
});</pre>

</div>

This example creates a server on port 8080 and sets to to respond with `Hello World!` on any request. When you use `response.send` it appends the input to the response.

#### [<span aria-hidden="true" class="octicon octicon-link"></span>](#static-file-servers)Static File Servers

Stir Fry has a static file server method build in. All you need to do is this

<div class="highlight highlight-source-js">

<pre><span class="pl-k">var</span> StirFry <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">'</span>stirfry<span class="pl-pds">'</span></span>);
<span class="pl-k">var</span> server  <span class="pl-k">=</span> <span class="pl-k">new</span> <span class="pl-en">StirFry</span>(<span class="pl-c1">8080</span>);
<span class="pl-smi">server</span>.<span class="pl-en">request</span>(<span class="pl-smi">StirFry</span>.<span class="pl-en">static</span>(<span class="pl-s"><span class="pl-pds">'</span>public<span class="pl-pds">'</span></span>));</pre>

</div>

Public is the folder that the files get served from

#### [<span aria-hidden="true" class="octicon octicon-link"></span>](#asynchronous-operations)Asynchronous Operations

Stir Fry lets you run multiple asynchronous operations at once. You can do all the preprocessing you want in the `server.process` layer, and then once all of those are done, it runs `server.pre` listeners, and once those are done it runs `server.request` listeners.

<div class="highlight highlight-source-js">

<pre><span class="pl-k">var</span> StirFry <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">'</span>stirfry<span class="pl-pds">'</span></span>);
<span class="pl-k">var</span> server  <span class="pl-k">=</span> <span class="pl-k">new</span> <span class="pl-en">StirFry</span>(<span class="pl-c1">8080</span>);

<span class="pl-k">var</span> fs <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">'</span>fs<span class="pl-pds">'</span></span>);

<span class="pl-smi">server</span>.<span class="pl-en">pre</span>(<span class="pl-k">function</span> (<span class="pl-smi">request</span>, <span class="pl-smi">response</span>, <span class="pl-smi">end</span>, <span class="pl-k">async</span>) {
    <span class="pl-k">async</span>.<span class="pl-c1">start</span>();
    <span class="pl-smi">fs</span>.<span class="pl-en">readFile</span>(<span class="pl-s"><span class="pl-pds">'</span>file.txt<span class="pl-pds">'</span></span>, <span class="pl-k">function</span> (<span class="pl-smi">err</span>, <span class="pl-smi">data</span>) {
        <span class="pl-smi">response</span>.<span class="pl-c1">data</span> <span class="pl-k">=</span> <span class="pl-smi">data</span>.<span class="pl-c1">toString</span>();
        <span class="pl-k">async</span>.<span class="pl-en">done</span>();
    });

});
<span class="pl-smi">server</span>.<span class="pl-en">request</span>(<span class="pl-k">function</span> (<span class="pl-smi">request</span>, <span class="pl-smi">response</span>) {
    <span class="pl-smi">response</span>.<span class="pl-c1">send</span>(<span class="pl-smi">response</span>.<span class="pl-c1">data</span>);
});</pre>

</div>

This program uses `fs.readFile` to add a property to the response object and then sends it to the user. There are loads of more efficient ways to do this, this is just an example of how to use async.

#### [<span aria-hidden="true" class="octicon octicon-link"></span>](#sending-files)Sending Files

Stir Fry has a build in `response.sendFile` method, here is an example

<div class="highlight highlight-source-js">

<pre><span class="pl-k">var</span> StirFry <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">'</span>stirfry<span class="pl-pds">'</span></span>);
<span class="pl-k">var</span> server  <span class="pl-k">=</span> <span class="pl-k">new</span> <span class="pl-en">StirFry</span>(<span class="pl-c1">8080</span>);
<span class="pl-smi">server</span>.<span class="pl-en">request</span>(<span class="pl-k">function</span> (<span class="pl-smi">request</span>, <span class="pl-smi">response</span>) {
    <span class="pl-smi">response</span>.<span class="pl-en">sendFile</span>(<span class="pl-s"><span class="pl-pds">'</span>file.html<span class="pl-pds">'</span></span>);
});</pre>

</div>

#### [<span aria-hidden="true" class="octicon octicon-link"></span>](#responding-only-to-certain-requests)Responding Only to Certain Requests

When you create a request, preprocessor, or processor listener, you have the option of limiting it to certain requests by regex matching. Here is an example

<div class="highlight highlight-source-js">

<pre><span class="pl-k">var</span> StirFry <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">'</span>stirfry<span class="pl-pds">'</span></span>);
<span class="pl-k">var</span> server  <span class="pl-k">=</span> <span class="pl-k">new</span> <span class="pl-en">StirFry</span>(<span class="pl-c1">8080</span>);
<span class="pl-smi">server</span>.<span class="pl-en">request</span>(<span class="pl-sr"><span class="pl-pds">/</span><span class="pl-cce">\/</span><span class="pl-c1">.</span><span class="pl-k">*?</span><span class="pl-cce">\/</span>hi<span class="pl-pds">/</span></span>, <span class="pl-k">function</span> (<span class="pl-smi">request</span>, <span class="pl-smi">response</span>) {
    <span class="pl-smi">response</span>.<span class="pl-c1">send</span>(<span class="pl-s"><span class="pl-pds">"</span>hi<span class="pl-pds">"</span></span>);
});</pre>

</div>

You can access regex capture groups by accessing `request.params` as an array, `request.params` also processes query strings in the request.

#### [<span aria-hidden="true" class="octicon octicon-link"></span>](#post-requests)Post Requests

You can access post data by accessing `request.post` as an associative array

<footer class="site-footer"><span class="site-footer-owner">[Stirfry](https://github.com/StirFry-js/stirfry) is maintained by [StirFry-js](https://github.com/StirFry-js).</span> <span class="site-footer-credits">This page was generated by [GitHub Pages](https://pages.github.com) using the [Cayman theme](https://github.com/jasonlong/cayman-theme) by [Jason Long](https://twitter.com/jasonlong).</span></footer>

</section>
