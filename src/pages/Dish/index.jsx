import { RxCaretLeft } from "react-icons/rx";
import { useMediaQuery } from 'react-responsive';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { api } from '../../services/api';
import { Container, Content } from "./styles";

import { Header } from '../../components/Header';
import { Menu } from "../../components/Menu";
import { ButtonText } from "../../components/ButtonText";
import { Tag } from '../../components/Tag';
import { NumberPicker } from "../../components/NumberPicker";
import { Button } from "../../components/Button";
import { Footer } from '../../components/Footer';


export function Dish({ isAdmin, user_id}){
    const isDesktop = useMediaQuery({minWidth: 1024});

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [data, setData] = useState(null);

    const navigate = useNavigate();
    const params = useParams();

    const [number, setNumber] = useState(1);
    const [cartId, setCardId] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleBack(){
        navigate(-1);
    }

    function handleEdit(){
        navigate(`/edit/${params.id}`);
    }

    useEffect(() => {
        async function fetchDish(){
            const response = await api.get(`/dishes/${params.id}`);
            setData(response.data);
        }
        fetchDish();
    }, []);

    async function handleInclude(){
        setLoading(true);

        try{
            const cartItem = {
                dish_id: data.id,
                name: data.name,
                quantity: number,
            };

            const response = await api.get('/carts', {params: {created_by: user_id}});
            const cart = response.data[0];

            if(cart){
                await api.patch(`/carts/${cart.id}`, {cart_items: [cartItem] });
            }else {
                const createResponse = await api.post('/carts', { cart_items: [cartItem], created_by: user_id});
                const createdCart = createResponse.data;

                setCartId(createdCart.id);
            }

            alert("Pedido adicionado ao carrinho!");
        }catch(error){
            if (error.message){
                alert(error.response.data.message);
            }else{
                alert("Não foi possível adicionar o pedido ao carrinho.");
                console.log("Erro ao adiconar pedido ao carrinho", error);
            }
        }finally{
            setLoading(false);
        }
    }

    return(
        <Container>
            {!isDesktop &&
            <Menu
                isAdmin={isAdmin}
                isDisabled={true}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                />
            }

            <Header
                isAdmin={isAdmin}
                isDisabled={true}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
            />

            {
                data &&
                <main>
                    <div>
                        <header>
                            <ButtonText onClick={handleBack}>
                                <RxCaretLeft/>
                                    Voltar
                            </ButtonText>
                        </header>

                        <Content>
                            <img src={`${api.defaults.baseURL}/files/${data.image}`} alt={data.name} />

                            <div>
                                <h1>{data.name}</h1>
                                <p>{data.description}</p>

                                {
                                    data.ingredients &&
                                    <section>
                                        {
                                            data.ingredients.map(ingredients => (
                                                <Tag
                                                    key={String(ingredients.id)}
                                                    title={ingredients.name}
                                                />
                                            ))
                                        }
                                    </section>
                                }

                                <div className="buttons">
                                    {isAdmin ?
                                        <Button
                                            title="Editar prato"
                                            className="edit"
                                            onClick={handleEdit}
                                            loading={loading}
                                        /> : 
                                        <>
                                            <span className="priceItem">R${data.price}</span>
                                            <NumberPicker number={number} setNumber={setNumber} />
                                            <Button
                                                title={
                                                    isDesktop ?                         
                                                    `Incluir pedido.`:
                                                    `Pedir.`
                                                }
                                                className="include"
                                                isCustomer={!isDesktop}
                                                onClick={handleInclude}
                                                loading={loading}
                                            />
                                        </>
                                        }
                                </div>
                            </div>
                        </Content>
                    </div>
                </main>
            }
            <Footer/>
        </Container>
    );
}

