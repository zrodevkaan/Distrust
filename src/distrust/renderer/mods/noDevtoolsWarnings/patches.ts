export default
[
    {
        find: 'UserDefenses:',
        replacements: [
            {
                match: /UserDefenses:function\(\)\{(.+?)\}/,
                replace: 'UserDefenses:function(){return ()=>{}}',
            },
        ],
    }
]