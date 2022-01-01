import { useState, useEffect } from 'react'
import Itemframe from '../components/Itemframe'


const GetArtifacts = ({close}) => {

    const [artifacts, setArtifacts] = useState([]);
    const [artifactDetails, setArtifactDetails] = useState([]);

    const [Loading,setLoading] = useState(false)

    let controller = new AbortController();

    const getArtifactArray = async ()=>{
        const response = await fetch(`https://api.genshin.dev/artifacts`,{
            signal: controller.signal
          })
        const data = await response.json()

       
        setArtifacts(data)
        
    }


    


    const getArtifactDetails = async ()=> {

        if (artifacts.length === 0) {
            console.log("No characters!")
            return
        }


        let tempData = []
        console.log("Fetching!")
        setLoading(true)

        for (let index = 0; index < artifacts.length; index++) {
            const response = await fetch(`https://api.genshin.dev/artifacts/${artifacts[index]}`,{
                signal: controller.signal
              })
            
            if (response.status >= 200 && response.status <= 299) {
                console.log("seems good")
                const data = await response.json()

                //Checking if icon exists for the artifacts if not skip em...
                const ImageExists = await fetch(`https://api.genshin.dev/artifacts/${artifacts[index]}/flower-of-life`,{
                    signal: controller.signal
                  })

                if(ImageExists.status === 404){
                    console.log("Image doesnt exist")
                    continue;
                }

                data.frameImage = `https://api.genshin.dev/artifacts/${artifacts[index]}/flower-of-life`
                data.uniqueKey = index + 2
                data.rarity = data.max_rarity
                tempData.push(data)
            }
            else if ( response.status === 404){
                console.log("Error 404")
                continue;
            }

               

            
        }

        setLoading(false)
        setArtifactDetails(tempData)

        sessionStorage.setItem("artifactDetails", JSON.stringify(tempData));
        
    }



    useEffect(() => {
        getArtifactArray().catch(err =>{
            console.log(err)
        })

        return ()=>{
            //cleanup
            controller.abort()
        }
    }, []);

    useEffect(() => {

        if(sessionStorage.getItem("artifactDetails") === null)
        {
            getArtifactDetails().catch(err =>{
                console.log(err)
            })
        }else{
            setArtifactDetails(JSON.parse(sessionStorage.getItem("artifactDetails")))
        }

        console.log("rendering")

        return ()=>{
            //cleanup
            controller.abort()
        }
    }, [artifacts]);



    return ( 
        <>
            { Loading && <h3>Loading...</h3>}
            {
                artifactDetails.map( artifact =>(
                    <div className="column is-1" key={artifact.uniqueKey} onClick={close}>
                        <Itemframe {...artifact}></Itemframe>
                    </div>
                ))
            }
        </>
     );

    


}
 
export default GetArtifacts;