function map_point(P,Q,A,B,X)
{
    if (A.type != "vec2" && A.type != "vec3" && A.type != "vec4")
    {
        return (1.0 - ((Math.abs(X-P))/Math.abs(Q-P))) * B + ((Math.abs(X-P))/Math.abs(Q-P)) * A 
    }
    return mix( A, B,  ((length(subtract(P,X))))/ length(subtract(P,Q)))
}
//console.log(map_point( vec2(2,2), vec2(4,4), vec2(0,0), vec2(5,5), vec2(2.2,2.2)))
// alert(map_point( vec2(2,2), vec2(4,4), vec2(0,0), vec2(5,5), vec2(2.2,2.2)))