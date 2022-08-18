function include(src)
{
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    document.getElementsByTagName('head')[0].appendChild(script);
}

function replaceAllText(element, regex, value)
{
    var children = element.childNodes,
        length = children.length;
    if (length > 5000)
    {
        return;
    }
    for(var i = 0; i < length; i++)
    {
        var child = children[i];
        if (child.nodeType == 1 && child.tagName !== 'SCRIPT' && child.className !== 'TinyMCE')
        {
            replaceAllText(child, regex, value);
        }
        else if(child.nodeType==3 && child.nodeValue)
        {
            child.nodeValue=child.nodeValue.replace(regex,value);
        }
    }
}