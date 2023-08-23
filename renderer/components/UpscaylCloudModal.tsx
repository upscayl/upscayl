import Image from "next/image"
import Link from "next/link"

export const UpscaylCloudModal = ({show, setShow}) => {
    return (
        <dialog className={`modal ${show && 'modal-open'}`}>
            <section className="modal-box flex flex-col text-center items-center gap-4">
                <p className="text-2xl font-semibold text-slate-200">Introducing Upscayl Cloud!</p>
                <p>We have opened a pre-registration survey for this new beta feature</p>
                <section className="text-start">
                    <ul className="list-disc">
                        <li>
                            <p>Harness the power of cloud!</p>
                        </li>
                        <li>
                            <p>Limited by hardware power? No more!</p>
                        </li>
                        <li>
                            <p>Use on any device!</p>
                        </li>
                    </ul>
                </section>
                <Image src="/1080p_banner.jpg" width={480} height={240} alt="Screenshot of the new homepage of Upscayl" />
                <p>Fill out the survey and...</p>
                <Link href={`https://www.upscayl.org` } target='_blank'><button className="bg-green-600 text-white rounded-2xl px-4 py-2">Join us on this new adventure!</button></Link>
            </section>
            <form method="dialog" className="modal-backdrop">
                <button onClick={() => setShow(false)}>close</button>
            </form>
        </dialog>
    )
}