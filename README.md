# dropbox-clone
<p>This is a basic Dropbox clone to sync files across multiple remote folders.</p>

<h3><a class="anchor" id="heading-features" href="#heading-features"><span class="glyphicon glyphicon-link"></span></a>Features</h3>

<ul>
<li>GET requests to get file or directory contents</li>
<li>HEAD request to get just the GET headers </li>
<li>PUT requests to create new directories and files with content</li>
<li>POST requests to update the contents of a file</li>
<li>DELETE requests to delete files and folders</li>
<li>Server will serve from <code>--dir</code> or cwd as root</li>
<li>Client will sync from server over TCP to cwd or CLI <code>dir</code> argument</li>
</ul>

<a href="https://github.com/sarankumarv/dropbox-clone/blob/master/dropbox_clone.gif">Video Walkthrough</a>
