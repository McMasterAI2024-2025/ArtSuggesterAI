import NavBar from "../components/NavBar";
import './About.css';

export default function About() {
    return (
        <>
            <NavBar />
            <main className="about-page">
                <section className="about-section">
                    <h2>What is Mac AI Art Suggester?</h2>
                    <p>
                    Art Suggester is an AI-based art recommendation tool designed to optimize image 
                    recognition techniques using a convolutional neural network (CNN). It identifies 
                    various art mediums such as paint, pencil crayons, and markers, providing personalized 
                    recommendations based on user preferences.
                    </p>
                </section>

                <section className="about-section">
                    <h2>Why we made Art Suggester</h2>
                    <p>
                    The goal was to train an AI model capable of determining the mediums of various artworks. 
                    Recent advancements in AI, particularly in CNNs and generative models, have made AI-driven 
                    art tools increasingly relevant. Art Suggester demonstrates the potential of AI to 
                    enhance art discovery by combining medium classification and color detection. 
                    The tool has applications in art education, galleries, and interior design, making art 
                    more accessible and engaging for everyone.
                    </p>
                </section>

                <section className="about-section">
                    <h2>How it works</h2>
                    <p>
                    The project uses a Convolutional Neural Network (CNN) built with TensorFlow to classify art mediums. 
                    The model was trained using images from various online databases consisting of paintings and drawings 
                    across different mediums such as paint, pencil crayons, and markers. The datasets used for training the 
                    model were collected from publicly available online databases featuring artwork in different mediums. This 
                    diverse dataset ensures the model can effectively identify and classify various artistic styles and tools. 
                    The database and user information, including favorited images, are hosted using MongoDB for efficient storage and retrieval. 
                    Colab notebooks used to create the models can be found in the backend folder of the project’s GitHub repository.
                    </p>
                    <img src="/images/flow_diagram_Art.png" alt="how we do it:flow chart diagram"/>
                    
                </section>
            </main>
        </>
    );
}
